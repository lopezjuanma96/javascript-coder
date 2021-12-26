class productManager {

    productManager(){
        this.list = [];
        readStorage();
    }

    readStorage(){
        var aux = localStorage.getItem("products")
        if(aux == null){
            $.getJSON("base_products.json", (ans, state) => {
                console.log("Reading from server since there's no cache...");
                if (state == "success"){
                    console.log("Successfully read from server!");
                    this.list=ans;
                } else {
                    console.log("Failed to load data from server. Check your internet connection.");
                }
            })
        }
    }

    findProductById(id_tofind){
        var aux = this.list.find((p) => p.id == id_tofind || undefined)
        return aux
    }

    findProductIndexById(id_tofind){
        var aux = this.list.findIndex((p) => p.id == id_tofind || undefined)
        return aux
    }

    getNameById(id_tofind, cart){
        var aux = this.findProductById(id_tofind);
        if(cart){
            if(aux.cart > 1){
                return aux.plural;
            } else {
                return aux.singular;
            }
        } else {
            if(aux.stock > 1){
                return aux.plural;
            } else {
                return aux.singular;
            }
        }
    }

    getAvailableStock(){
        return this.list.filter((p) => p.stock > 0);
    }

    getOutOfStock(){
        return this.list.filter((p) => p.stock <= 0);
    }

    getInCart(){
        return this.list.filter((p) => p.cart > 0);
    }

    addProductToCart(id_toadd){
        var aux = this.findProductById(id_toadd);
        if(aux.stock > 0){
            aux.stock--;
            aux.cart++;
        }
    }

    takeProductFromCart(id_totake){
        var aux = this.findProductById(id_totake);
        if(aux.cart > 0){
            aux.stock++;
            aux.cart--;
        }
    }

}

class productViewer {
    
    generateStock(manager){
        var txt = '<h3>¿Qué vas a comprar?</h3><div class="stock available">';
        const available = manager.getAvailableStock()
        for (var p of available) {
            txt += `<div class="${p.id}block">`
            txt += `<h3>${manager.getNameById(p.id)}</h3><p>Precio: ${p.price}</p><p>Stock: ${p.stock}</p>`;
            txt += `<input type="button" value="Agregar" id="${p.id}StockButton">`;
            txt += '</div>';
        }
        txt += '</div>';
        txt += '<div class="stock outof">';
        for (p of manager.getOutOfStock()) {
            txt += `<div class="${p.id}block">`
            txt += `<h3>${manager.getNameById(p.id)}</h3><p>Precio: ${p.price}</p><p>Agotado!</p>`;
            txt += `<input type="button" value="Agregar" id="${p.id}StockButton" disabled>`;
            txt += '</div>';
        }
        txt += '</div><hr>';
        //console.log(txt);
        return txt;
    }

    generateCart(manager){
        var txt = '<h3>Tus compras</h3><div class="cart">';
        const available = manager.getInCart()
        for (var p of available) {
            txt += `<div class="${p.id}block">`
            txt += `<h3>${manager.getNameById(p.id)}</h3><p>En Carrito: ${p.cart}</p>`;
            txt += `<input type="button" value="Agregar" id="${p.id}CartButton">`;
            txt += '</div>';
        }
        txt += '</div><hr>';
        //console.log(txt);
        return txt;
    }

    createView(manager){
        $("#app").hide().delay(2000).html("").append(this.generateStock(manager)).append(this.generateCart(manager)).fadeIn();
        this.defineEvents(manager);
    }

    updateView(manager){
        $("#app").html("").append(this.generateStock(manager)).append(this.generateCart(manager));
        this.defineEvents(manager);
    }

    defineEvents(manager){
        manager.getAvailableStock().map((p) => { //con map funciona pero con for no..
            $(`#${p.id}StockButton`).click((e) => {
                manager.addProductToCart(p.id);
                this.updateView(manager);
            }
            );
        });
        manager.getInCart().map((p) => { //con map funciona pero con for no..
            $(`#${p.id}CartButton`).click((e) => {
                manager.takeProductFromCart(p.id);
                this.updateView(manager);
            }
            );
        });
        /*for (var p of available){  //con los for me asignaba todos los eventos al ultimo producto no se por que
            console.log(p.id)
            $(`#${p.id}StockButton`).click((e) => {
                console.log(manager.getNameById(p.id))
                manager.addProductToCart(p.id);
                this.updateView(manager);
            }
            );
        }
        const inCart = manager.getInCart();
        for (var p of inCart){
            $(`#${p.id}CartButton`).click((e) => {
                manager.takeProductFromCart(p.id);
                this.updateView(manager);
            }
            );
        }*/
    }

}
pm = new productManager();
pv = new productViewer();
pm.readStorage()

$(document).ready( () => {
    pv.createView(pm);
}
)