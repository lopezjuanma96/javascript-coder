class cashManager {
    cash = 0;

    readStorage(){
        var aux = localStorage.getItem("cash")
        if(aux == null){
            this.cash = 0;
        } else {
            this.cash = parseFloat(aux);
        }
    }

    writeStorage(){
        try {
            localStorage.setItem("cash", this.cash);
        } catch {
            ;
        }
    }

    addCash(amt){
        this.cash += amt;
    }

    getCash(){
        return this.cash;
    }

    setCash(value){
        this.cash = value;
    }
}

class cashViewer {

    hoverCashActive = false;

    createView(manager){
        $("#currentCash").html(manager.getCash());
    }

    updateView(manager){
        if (parseFloat($("#currentCash").html()) != manager.getCash()){
            $("#currentCash").html(manager.getCash());
        }
        manager.writeStorage();
    }

    defineEvents(manager){
        $("#cashButton").click((e) => {
            this.toggleHoverCash();
        })
        $("#cashInput").keypress((e) => {
            if((e.which < 48 || e.which > 57) && e.which != 45){ 
                e.preventDefault();
            }
        });
        $("#cashInputConfirm").click((e) => {
            var aux = $("#cashInput").val();
            if (aux != null && aux != ""){
                manager.addCash(parseFloat(aux));
                this.updateView(manager);
            }
            this.toggleHoverCash();
        });
        $("#cashInputCancel").click((e) => {
            this.toggleHoverCash();
        });
    }

    toggleHoverCash(){
        this.hoverCashActive = !this.hoverCashActive;
        if (this.hoverCashActive){
            $(".hoverCash").fadeIn();//css("display", "initial");
        } else {
            $(".hoverCash").fadeOut(400, (e) => {$("#cashInput").val("")});//css("display", "none");
        }
    }
}

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
        } else {
            console.log("Reading from cache..");
            this.list = JSON.parse(localStorage.getItem("products"));
        }
    }

    writeStorage(){
        try{
            console.log("Saving to cache..");
            localStorage.setItem("products", JSON.stringify(this.list));
            console.log("Cache saved");
        } catch(QuotaExceededError){
            console.log("Failed to save cache..")
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
    
    showCart = false;

    generateStock(manager){
        var txt = '<div id="stockWrapper"><h3>??Qu?? vas a comprar?</h3><div class="stock available">';
        const available = manager.getAvailableStock()
        for (var p of available) {
            txt += `<div class="${p.id}block">`
            txt += `<img src="${p.image}" alt="${p.id}" width="100%"><h3>${manager.getNameById(p.id)}</h3><p>Precio: ${p.price}</p><p>Stock: ${p.stock}</p>`;
            txt += `<div class="button-container"><input type="button" value="Agregar" id="${p.id}StockButton"></div>`;
            txt += '</div>';
        }
        txt += '</div>';
        txt += '<div class="stock outof">';
        for (p of manager.getOutOfStock()) {
            txt += `<div class="${p.id}block">`
            txt += `<img src="${p.image}" alt="${p.id}" width="100%"><h3>${manager.getNameById(p.id)}</h3><p>Precio: ${p.price}</p><p>Agotado!</p>`;
            txt += `<div class="button-container"><input type="button" value="Agregar" id="${p.id}StockButton" disabled></div>`;
            txt += '</div>';
        }
        txt += '</div></div>';
        //console.log(txt);
        return txt;
    }

    generateCart(manager, hidden=false){
        if (hidden){
            var txt = '<div id="cartWrapper" style="display:none"><h3>Tus compras</h3><div class="cart">';
        } else {
            var txt = '<div id="cartWrapper"><h3>Tus compras</h3><div class="cart">';
        }
        const available = manager.getInCart()
        for (var p of available) {
            txt += `<div class="${p.id}block">`
            txt += `<img src="${p.image}" alt="${p.id}" width="100%"><h3>${manager.getNameById(p.id)}</h3><p>En Carrito: ${p.cart}</p>`;
            txt += `<div class="button-container"><input type="button" value="Quitar" id="${p.id}CartButton"></div>`;
            txt += '</div>';
        }
        txt += '</div></div>';
        //console.log(txt);
        return txt;
    }

    createView(manager){
        $("#app").hide().delay(2000).html("").append(this.generateStock(manager)).fadeIn();
        this.defineEvents(manager);
    }

    updateView(manager){
        if (this.showCart) {
            $("#app").html("").append(this.generateCart(manager)).append(this.generateStock(manager));
        } else {
            $("#app").html("").append(this.generateStock(manager));
        }
        this.defineEvents(manager);
        manager.writeStorage();
    }

    toggleCart(manager){
        this.showCart = !this.showCart;
        if(this.showCart){
            $("#app").prepend(this.generateCart(manager, true));
            $("#cartWrapper").slideDown(400, (e) => {
                this.updateView(manager);
            });
        } else {
            $("#cartWrapper").slideUp(400, (e) => {
                this.updateView(manager);
            });
        } //just to make sure
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
pm.readStorage();

cm = new cashManager();
cv = new cashViewer();
cm.readStorage();

$(document).ready( () => {
    pv.createView(pm);
    cv.createView(cm);
    cv.defineEvents(cm);
    $('#headerButton').click((e) => {
        pv.toggleCart(pm);
    });
}
)