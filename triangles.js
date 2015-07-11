/*
Triangles.js - v0.8
Copyright (c) 2015 Taylor Lei
Licensed under the MIT license.
*/
var TriangleBG = function(opts) {
   if (opts.canvas.tagName !== "CANVAS") {
      console.log("Warning: triangles.js requires a canvas element!");
      return;
   }
   //set primary canvas and context
   this.canvas = opts.canvas;
   this.ctx = this.canvas.getContext("2d");

   //used when canvas is resized
   this.alternateElem = false;

   this.ctx.canvas.height = this.canvas.clientHeight;
   this.ctx.canvas.width = this.canvas.clientWidth;

   //rendering opts for padding, colors...; default values
   this.render = {
      offset : {x: -50, y:-50},
      pad : 2,
      mouseLightRadius : this.ctx.canvas.width/3,
      mouseLight : opts.mouseLight,
      mouseLightIncrement : 10,
      resizeAdjustment : false,
      variance : 1.3,
      pattern : "x*y",
      color1 : {
         hue: Math.round(180*Math.random()),
         saturation : Math.round(100*Math.random()),
         lightness: Math.round(100*Math.random())
      },
      color2 : {
         hue: 0,
         saturation : 0,
         lightness: 0
      },
      colorDelta : {
         hue: 0.5,
         saturation : 0,
         lightness: 0
      }
   }
   //default colors
   this.render.color2.hue = this.render.color1.hue;
   this.render.color2.saturation = this.render.color1.saturation;
   this.render.color2.lightness = this.render.color1.lightness + 2;

   this.net = {
      w:0, h:0,
      cellWidth: 100,
      cellHeight: 100
   };

   this.vert = new Array();
   this.mouse = {x:null,y:null}

   //set baseCell width and height from options:
   if (opts.alternateElem) {
      this.alternateElem = opts.alternateElem;
   }
   if (opts.cellWidth) {
      this.net.cellWidth = opts.cellWidth;

   }
   if (opts.cellHeight) {
      this.net.cellHeight = opts.cellHeight;
   }
   if (opts.mouseLight) {
      this.render.mouseLightRadius = opts.mouseLightRadius;
      if (opts.mouseLightRadius) {
         this.render.mouseLightRadius = opts.mouseLightRadius;
      }
      if (opts.mouseLightIncrement) {
         this.render.mouseLightIncrement = opts.mouseLightIncrement;
      }
   }
   if (opts.variance) {
      this.render.variance = opts.variance;
   }
   if (opts.pattern) {
      this.render.pattern = opts.pattern;
   }
   if (opts.resizeAdjustment) {
      this.render.resizeAdjustment = opts.resizeAdjustment;
   }
   if (opts.baseColor1) {
      if (opts.baseColor1.baseHue) {
         this.render.color1.hue = opts.baseColor1.baseHue;
         this.render.color2.hue = opts.baseColor1.baseHue;
      }
      if (opts.baseColor1.baseSaturation) {
         this.render.color1.saturation = opts.baseColor1.baseSaturation;
         this.render.color2.saturation = opts.baseColor1.baseSaturation;
      }
      if (opts.baseColor1.baseLightness) {
         this.render.color1.lightness = opts.baseColor1.baseLightness;
         this.render.color2.lightness = opts.baseColor1.baseLightness + 2;
      }
   }
   if (opts.baseColor2) {
      if (opts.baseColor2.baseHue) {
         this.render.color2.hue = opts.baseColor2.baseHue;
      }
      if (opts.baseColor2.baseSaturation) {
         this.render.color2.saturation = opts.baseColor2.baseSaturation;
      }
      if (opts.baseColor2.baseLightness) {
         this.render.color2.lightness = opts.baseColor2.baseLightness;
      }
   }
   if (opts.colorDelta) {
      if (opts.colorDelta.hue) {
         this.render.colorDelta.hue = opts.colorDelta.hue;
      }
      if (opts.colorDelta.saturation) {
         this.render.colorDelta.saturation = opts.colorDelta.saturation;
      }
      if (opts.colorDelta.lightness) {
         this.render.colorDelta.lightness = opts.colorDelta.lightness;
      }
   }
   //vertices
   this.generateNet();

   //window size change, so canvas doesn't deform
   window.addEventListener("resize", this, false);
   window.addEventListener("mousemove", this, false);
   this.handleEvent = function(e) {
      switch(e.type) {
         case "resize":
            if (this.alternateElem) {
               var dataURL = this.canvas.toDataURL("image/png");
               this.alternateElem.style.backgroundImage = "url("+dataURL+")";
            }
            if (this.render.resizeAdjustment) {
               this.ctx.canvas.height = this.canvas.clientHeight;
               this.ctx.canvas.width = this.canvas.clientWidth;
            }
         break;
         case "mousemove":
            var scrollTop = document.body.scrollTop || document.documentElement.scrollTop;
            var scrollLeft = document.body.scrollLeft || document.documentElement.scrollLeft;
            this.mouse.x = e.clientX - this.render.offset.x - this.canvas.offsetLeft + scrollLeft;
            this.mouse.y = e.clientY - this.render.offset.y - this.canvas.offsetTop + scrollTop;
         break;
      }
   }

   this.delete = false;
};
TriangleBG.prototype.generateNet = function() {
   //fit a number of cellWidth to screen + so no problems can happen, pad by render.pad on each side
   this.net.w = Math.floor(screen.width/this.net.cellWidth) + this.render.pad*2; //+4 for edges
   this.net.h = Math.floor(screen.height/this.net.cellHeight) + this.render.pad*2;
   //render padding
   this.render.offset.x = -this.render.pad*this.net.cellWidth;
   this.render.offset.y = -this.render.pad*this.net.cellWidth;

   //generate vertices with random offsets
   var x;
   for (x = 0; x < this.net.w; x++) {
      this.vert.push([]);

      //how random are the offsets?
      var y;
      for (y = 0; y < this.net.h; y++) {
         this.vert[x].push({
            offset : {
               x: Math.floor(100 * Math.random()*this.net.cellWidth/this.render.variance - this.net.cellWidth/this.render.variance*2 ) / 100 , //x offset around -this.cellWidth/4 to this.cellWidth/4, to 2 decimals
               y: Math.floor(100 * Math.random()*this.net.cellHeight/this.render.variance - this.net.cellHeight/this.render.variance*2 ) / 100
            }
         });
      }
   }

   this.renderLoop();
   if (this.alternateElem) {
      var dataURL = this.canvas.toDataURL("image/png");
   }
   this.alternateElem.style.backgroundImage = "url("+dataURL+")";
};
TriangleBG.prototype.renderLoop = function() {
   if (this.delete === true) {
      return;
   }

   this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
   this.ctx.translate(this.render.offset.x, this.render.offset.y);
   for (x = 0; x < this.net.w-1; x++) {
      var y;
      for (y = 0; y < this.net.h-1; y++) {
         var drawX, drawY;
         var centerX1=0, centerY1=0, centerX2=0, centerY2=0;
         var hueDelta = 0;
         var pattern;
         var saturationDelta = 0;
         var lightnessDelta = 0;
         var lightnessIncrement = 0;
         var mouseLightRadius = this.render.mouseLightRadius;
         //render pattern
         if (this.render.pattern === "x*y") {
            pattern = Math.abs(x*y);
         }
         else if (this.render.pattern === "x"){
            pattern = Math.abs(x);
         }
         else if (this.render.pattern === "y"){
            pattern = Math.abs(y);
         }
         hueDelta =  pattern * this.render.colorDelta.hue;
         saturationDelta = 0;
         lightnessDelta = 0;

         //1st triangle
         this.ctx.beginPath();

         drawX = x * this.net.cellWidth + this.vert[x][y].offset.x;
         drawY = y * this.net.cellHeight + this.vert[x][y].offset.y;
         centerX1+=drawX;
         centerY1+=drawY;
         this.ctx.lineTo(drawX, drawY);

         drawX = x * this.net.cellWidth + this.vert[x][y+1].offset.x;
         drawY = (y+1) * this.net.cellHeight + this.vert[x][y+1].offset.y;
         centerX1+=drawX;
         centerY1+=drawY;
         this.ctx.lineTo(drawX, drawY);

         drawX = (x+1) * this.net.cellWidth + this.vert[x+1][y+1].offset.x;
         drawY = (y+1) * this.net.cellHeight + this.vert[x+1][y+1].offset.y;
         centerX1+=drawX;
         centerY1+=drawY;
         this.ctx.lineTo(drawX, drawY);

         this.ctx.closePath();

         centerX1 = centerX1/3;
         centerY1 = centerY1/3;
         if (this.render.mouseLight && Math.pow(Math.abs(this.mouse.x - centerX1),2) + Math.pow(Math.abs(this.mouse.y-centerY1),2) < Math.pow(mouseLightRadius,2)) {
            var radius = Math.sqrt( Math.pow(Math.abs(this.mouse.x-centerX1),2) + Math.pow(Math.abs(this.mouse.y - centerY1),2) );
            lightnessIncrement = (mouseLightRadius-radius)/(mouseLightRadius)*this.render.mouseLightIncrement;
         }


         var col1 = 'hsl(' + Math.floor(this.render.color1.hue + hueDelta) + ', ' + Math.floor(this.render.color1.saturation + saturationDelta) +  '% ,' + (this.render.color1.lightness + lightnessDelta + lightnessIncrement) +'%)';
         this.ctx.fillStyle = col1;
         this.ctx.strokeStyle = col1;
         this.ctx.fill();
         this.ctx.stroke();

         //2nd triangle
         this.ctx.beginPath();

         drawX = x * this.net.cellWidth + this.vert[x][y].offset.x;
         drawY = y * this.net.cellHeight + this.vert[x][y].offset.y;
         centerX2+=drawX;
         centerY2+=drawY;
         this.ctx.lineTo(drawX, drawY);

         drawX = (x+1) * this.net.cellWidth + this.vert[x+1][y].offset.x;
         drawY = y * this.net.cellHeight + this.vert[x+1][y].offset.y;
         centerX2+=drawX;
         centerY2+=drawY;
         this.ctx.lineTo(drawX, drawY);

         drawX = (x+1) * this.net.cellWidth + this.vert[x+1][y+1].offset.x;
         drawY = (y+1) * this.net.cellHeight + this.vert[x+1][y+1].offset.y;
         centerX2+=drawX;
         centerY2+=drawY;
         this.ctx.lineTo(drawX, drawY);

         this.ctx.closePath();

         centerX2 = centerX2/3;
         centerY2 = centerY2/3;
         if (this.render.mouseLight && Math.pow(Math.abs(this.mouse.x - centerX2),2) + Math.pow(Math.abs(this.mouse.y-centerY2),2) < Math.pow(mouseLightRadius,2)) {
            var radius = Math.sqrt( Math.pow(Math.abs(this.mouse.x-centerX2),2) + Math.pow(Math.abs(this.mouse.y - centerY2),2) );
            lightnessIncrement = (mouseLightRadius-radius)/(mouseLightRadius)*this.render.mouseLightIncrement;
         }
         var col2 = 'hsl(' + Math.floor(this.render.color2.hue + hueDelta) + ', ' + Math.floor(this.render.color2.saturation + saturationDelta) +  '% ,' + (this.render.color2.lightness + lightnessDelta + lightnessIncrement) +'%)';
         this.ctx.fillStyle = col2;
         this.ctx.strokeStyle = col2;
         this.ctx.fill();
         this.ctx.stroke();
      }
   }
   this.ctx.translate(-this.render.offset.x, -this.render.offset.y);
   if (this.render.mouseLight) {
      window.setTimeout(this.renderLoop.bind(this), 1000/30);
   }
};
TriangleBG.prototype.delete = function() {
   this.delete = true;
};
