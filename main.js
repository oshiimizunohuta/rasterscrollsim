/* 
 * The MIT License
 *
 * Copyright 2017 bitchunk.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */


IMAGE_DIR = 'img';
var imageName = 'ui_common'
		;
var MS = function (q) {
	return makeSpriteQuery(imageName, q);
}, MR = makeRect, CTO = cellhto
		;
var SCROLL;
var makeEle = function (tag) {
	return document.createElement(tag);
}, getEles = function (q) {
	return document.querySelectorAll(q);
};

var RasterScrollSimulator = function () {
	return;
};

RasterScrollSimulator.prototype = {
	init: function () {
		var self = this
				;

		this.rectCount = 0;

		loadImages([imageName], function () {
			self.loaded();
		});


	},
	loaded: function () {
		var self = this
				, MSSC = makeSpriteSwapColor
				, el
				;
		this.charaChips = {
			win: MS('(1+2:0+1 2*37 1|fh;(2|r3 0*38 2|r1)^6!;1|fv 2|fv*38 1|fh|fv)')
			, coil: MS('(5+2:3+3*20)^3')
			, sctop: MS('(0*2 12+4:5+1 12+4:5+1|fh 0|fh*2;0 10+2:6+1 11+5:4+1 77 107|fh 0|fh*2;0 12+4:6+1 0 0|fh 12+4:6+1|fh 0|fh;10+6:7+2 10+6:7+2|fh)*4')
			, scbottom: MS('((0 155;0^2 10+1:9+2) (12+4:9+2 12+4:9+2|fh (155|fh 0|fh;154|fh 0|fh)!;0*2 10+2:5+1 10+2:5+1|fh 0*2 170|fh 0|fh)!;0*4 10+2:5+1 10+2:5+1|fh 0*4;(0*4)^3 14+2:11+3 14+2:11+3|fh (0*4)^3)*4')

			, helpwin: MS('((2+1:1+2 2+1:1+2|fh)*20!;(0*40)^4!;(2+1:1+2 2+1:1+2|fh)*20)')
			, transring: MS('((8+2:10+3 8+2:10+3|fh)*10!;(216 185*2 216|fh)*10;((8+2:12+1 8+2:12+1|fh)*10)^2!;(216|fv 185|fv*2 216|fh|fv)*10;(8+2:10+3|fv 8+2:10+3|fh|fv)*10)')
			, rectstart_1: MS('41|r2')
			, rectstart_1p: null
			, rectstart_2: MS('41|r3')
			, rectstart_2p: null
		};

		this.charaChips.rectstart_1p = MSSC(this.charaChips.rectstart_1, [COLOR_WHITE], [[248, 184, 0, 255]]);
		this.charaChips.rectstart_2p = MSSC(this.charaChips.rectstart_2, [COLOR_WHITE], [[248, 184, 0, 255]]);
		this.charaChips.rectstart_2.setSwapColor([[88, 248, 152, 255]], [[248, 184, 0, 255]]);
		this.charaChips.rectstart_1.setSwapColor([[164, 228, 252, 255]], [[248, 184, 0, 255]]);

		this.canvasPos = {
			start: {x: 0, y: 0}
			, end: {x: 0, y: 0}
		};
		this.gripPos = {
			start: {x: 0, y: 0}
			, end: {x: 0, y: 0}
		};
		this.mouse = new PointingControll();
		this.keyboard = new KeyControll();
		this.lineSnapPosition = null;
		this.isGridSnap = false;
		this.dragRect = null;
		this.trims = [];
		this.scenes = {};
		makeCanvasScroll('bg1');
		makeCanvasScroll('bg2');
		makeCanvasScroll('sprite');
		makeCanvasScroll('tmp');
		makeCanvasScroll('screen');


		this.initScroll();
		this.initScene();
		this.makeScrollPannel(SCROLL.bg1);
		this.makeScrollPannel(SCROLL.bg2);

		this.mouse.init(SCROLL.screen, SCROLL.tmp);
		this.mouse.appendTappableItem(SCROLL.bg1.getRect(), function (item, x, y) {
			self.scenes.rect_cursor.pushOrder('sceneDrawRectCursor', 0, {side: 1, position: self.canvasPos});
			self.canvasPos.start.x = !self.isGridSnap ? x : x - (x % 8);
			self.canvasPos.start.y = !self.isGridSnap ? y : y - (y % 8);
		}, function (item, x, y) {
			self.canvasPos.end.x = !self.isGridSnap ? x : x - (x % 8);
			self.canvasPos.end.y = !self.isGridSnap ? y : y - (y % 8);
			self.createRasterRect(MR([0, self.canvasPos.start.y, SCROLL.bg1.getSize().w, self.canvasPos.end.y].join(' ') + ' :pos'), 1);
			self.scenes.rect_cursor.removeOrder();
		}, 'rect_1', 'left');

		this.mouse.appendTappableItem(SCROLL.bg1.getRect(), function (item, x, y) {
			self.scenes.rect_cursor.pushOrder('sceneDrawRectCursor', 0, {side: 2, position: self.canvasPos});
			self.canvasPos.start.x = !self.isGridSnap ? x : x - (x % 8);
			self.canvasPos.start.y = !self.isGridSnap ? y : y - (y % 8);
		}, function (item, x, y) {
			self.canvasPos.end.x = !self.isGridSnap ? x : x - (x % 8);
			self.canvasPos.end.y = !self.isGridSnap ? y : y - (y % 8);
			self.createRasterRect(MR([0, self.canvasPos.start.y, SCROLL.bg1.getSize().w, self.canvasPos.end.y].join(' ') + ' :pos'), 2);
			self.scenes.rect_cursor.removeOrder();
		}, 'rect_2', 'right');


		this.mouse.appendFlickableItem(SCROLL.bg1.getRect(), function (item, x, y) {
			self.canvasPos.end.x = !self.isGridSnap ? x : x - (x % 8);
			self.canvasPos.end.y = !self.isGridSnap ? y : y - (y % 8);
//						console.log(x, y);
		}, function (item, x, y) {
			console.log(x, y);

		}, 'rect_flip', 'common');
		
		
		//Raster Grip Controll
		this.target = {
			start: {x: 0, y: 0}
			, end: {x: 0, y: 0}
			, clent: {x: 0, y: 0}
			, ev: null
		};
//		document.body.onmousemove = function(e){
//			self.dragRasterGrip(e);
//		};
		document.body.ondragover = function(e){
			self.dragRasterGrip(e);
		};
		document.body.onmouseup = function(e){
			self.dragEndRasterGrip(self.target.ev);
		};
		
		this.keyboard.initCommon();
		this.keyboard.setKey('ctrl', 17);
		this.keyboard.setKey('shift', 16);

		this.main();
	},
	initScroll: function () {
		var x, y, charaChips = this.charaChips
				;
		SCROLL = getScrolls();
		SCROLL.bg1.clear(COLOR_BLACK);
		SCROLL.bg1.drawSprite(charaChips.win, 0, 0);
		SCROLL.bg1.drawSprite(charaChips.coil, 0, charaChips.win.h);
		y = charaChips.win.h + charaChips.coil.h;
		SCROLL.bg1.drawSprite(charaChips.sctop, 0, y);
		y = charaChips.win.h + charaChips.coil.h + charaChips.sctop.h;
		SCROLL.bg1.drawSprite(charaChips.scbottom, 0, y);

		SCROLL.bg2.clear(COLOR_BLACK);
		SCROLL.bg2.drawSprite(charaChips.helpwin, 0, 0);
		SCROLL.bg2.drawSprite(charaChips.transring, 0, charaChips.helpwin.h);
		SCROLL.bg2.clear(COLOR_WHITE, makeRect(0, 0, 40, 20));
		SCROLL.bg2.y = SCROLL.bg2.getSize().h;

		SCROLL.bg1.rasterVolatile = false;
		SCROLL.bg2.rasterVolatile = false;

//		this.refreshInput();
	},
	
	makeScrollPannel: function(scroll){
		var p, block, el = []
			, self = this
			, make = function(tag){
				return document.createElement(tag);
			}
		;
		//after initScroll
		p = make('div');
//		p.style.display = 'inline-block';
//		p.style.verticalAlign = 'middle';
		
		el[0] = make('span');
		el[0].className = 'name';
		el[0].innerText = scroll.name;
		el[1] = make('br');
		el[2] = make('span');
		el[2].innerText = 'x:';
		el[3] = make('input');
		el[3].type = 'text';
		el[3].className = 'pos x';
		el[4] = make('input');
		el[4].type = 'range';
		el[4].className = 'slide x';
		el[5] = make('br');
		el[6] = make('span');
		el[6].innerText = 'y:';
		el[7] = make('input');
		el[7].type = 'text';
		el[7].className = 'pos y';
		el[8] = make('input');
		el[8].type = 'range';
		el[8].className = 'slide y';
		el[9] = make('br');
		
		el.forEach(function(a){
			p.appendChild(a);
		});
		el[3].value = scroll.x;
		el[3].onchange = function(e){
			SCROLL[scroll.name].x = e.target.value;
			el[4].value  = e.target.value;
		},
		
		el[4].min = -scroll.getSize().w;
		el[4].max = scroll.getSize().w;
		el[4].style.width = (scroll.getSize().w / 2) + 'px';
		el[4].value = scroll.x;
		el[4].oninput = function(e){
			var v = self.isGridSnap ? e.target.value - (e.target.value % 8) : e.target.value;
			e.target.previousSibling.value = v;
			scroll.x = v;
		};
		
		el[7].value = scroll.y;
		el[7].onchange = function(e){
			SCROLL[scroll.name].y = e.target.value;
			el[8].value  = e.target.value;
		},
		
		el[8].min = -scroll.getSize().h;
		el[8].max = scroll.getSize().h;
		el[8].style.width = (scroll.getSize().h / 2) + 'px';	
		el[8].value = scroll.y;
		el[8].oninput = function(e){
			var v = self.isGridSnap ? e.target.value - (e.target.value % 8) : e.target.value;
			if(self.isGridSnap){
				
			}
			e.target.previousSibling.value = v;
			scroll.y = e.target.value = v;
		};
	
		block = getEles('#scroll-block')[0];
		block.appendChild(p);
	},
	
	initScene: function () {
		this.scenes = {
			rect_cursor: makeScene()
			, keys: makeScene()
		};

		this.scenes.keys.pushOrder('sceneKeychek', 0);

	},
	parseRaster: function (query) {
		var a = query.split(' ')
				;
		return {line: a[0] | 0, x: a[1] | 0, y: a[2] | 0, h: a[3] | 0};
	},
//				getQueryById: function(id){
////					getEles("#" + p.id)[0]);
//				},

	getRasterByElement: function (element) {
		while (element.className !== 'raster-rect-block') {
			element = element.parentNode;
			if (element.tagName === 'BODY') {
				return null;
			}
		}
		;
		return this.parseRaster(element.querySelector('.raster-query').innerText);

	},
	getScrollByParent: function (parent) {
		return this.getScrollByElement(parent.querySelector('.raster-query'));
	},
	getScrollByChild: function (p) {
		if(p == null){
			return null;
		}
		while (p.className !== 'raster-rect-block') {
			p = p.parentNode;
			if (p.tagName === 'BODY') {
				return null;
			}
		}
		return this.getScrollByParent(p);
	},
	getScrollByElement: function (element) {
		return SCROLL[this.getScrollSideByName(element.className)];
	},
	getScrollSideByName: function (name) {
		var scr = name.indexOf('bg1') >= 0 ? 'bg1' : 'bg2'
				;
		return scr;
	},
	/**
	 * make raster script codes
	 * @param {string} query
	 * @param {string} scroll side
	 * @returns {start: rasterCode-start, end: rasterCode-end}
	 */
	makeRasterCodes: function (query, scr) {
		var raster = this.parseRaster(query)
				, rasterCode = {
					start: scr + ".setRasterHorizon(" + raster.line + ", " + raster.x + ", " + raster.y + ");"
					, end: scr + ".setRasterHorizon(" + (raster.line + raster.h) + ", " + 0 + ", " + 0 + ");"
				}
		;
		return rasterCode;
	},
	/**
	 * make raster script codes
	 * @param {number} id
	 * @returns {start: rasterCode-start, end: rasterCode-end}
	 */
	makeRasterCodesById: function (id) {
		var rele = getEles("#" + id)[0].querySelector('.raster-query')
				, q = rele.innerText
				, rasterCode = this.makeRasterCodes(rele.innerText, this.getScrollSideByName(rele.className))
				;
		return rasterCode;
	},
	updateRaster: function (scr, query) {
		var applyRas
				;
		applyRas = this.parseRaster(query);
		scr.setRasterHorizon(applyRas.line, applyRas.x, applyRas.y);
		scr.setRasterHorizon(applyRas.line + applyRas.h, 0, 0);
	},
	createRasterRect: function (rect, side) {
		var cname = 'raster-rect'
				, area = makeEle('span')
				, block = makeEle('div')
				, button = makeEle('button')
				, span = makeEle('span')
				, self = this
				;

		area.draggable = true;
		area.style.cursor = 'move';
		area.innerHTML = [rect.y, 0, 0, rect.h].join(' ');
		span.className = 'raster-query bg' + side;
		span.appendChild(area);
		block.appendChild(span);

		block.id = cname + (++this.rectCount);
		block.className = cname + '-block';
		block.appendChild(button);
		block.appendChild(makeEle('br'));

		button.value = "del";
		button.innerHTML = 'del';
		button.style.cursor = 'pointer';
		getEles('#rectlist')[0].appendChild(block);

		this.refreshRasterCode();
		button.onclick = function (e) {
			var p = e.target.parentNode
					, scr = self.getScrollByParent(p)
					, raster = self.getRasterByElement(e.target)
					;

			scr.resetRaster(raster.line, raster.line + 1);
			scr.resetRaster(raster.line + raster.h, raster.line + raster.h + 1);
			getEles('#rectlist')[0].removeChild(getEles("#" + p.id)[0]);
			self.refreshRasterCode();

			return false;
		};
//		area.ondrag = upd;
//		area.ondragover = upd;
//		area.ondragleave = upd;
//		area.ondragexit = upd;
//		area.ondragenter = upd;
		area.onmouseover = function(e){
			var raster = self.getRasterByElement(e.target)
				, grip = self.gripPos
			;
			self.scenes.rect_cursor.removeOrder();
			grip.start.x = 0;
			grip.end.x = 0;
			grip.start.y = raster.line;
			grip.end.y = raster.line + raster.h;
			self.scenes.rect_cursor.pushOrder('sceneDrawRectCursor', 0, {side: side, position: self.gripPos});
		};
		area.onmouseout = function(e){
			self.scenes.rect_cursor.removeOrder();
		};
		area.ondragstart = function (e) {
			e.dataTransfer.setData('Element', e.target.id );
		};
		
		area.onmousedown = function(e){
			self.dragStartRasterGrip(e);
		};

		area.ondragend = function (e) {
			self.refreshRasterCode();
		};

	},
	dragStartRasterGrip: function(e){
		var m = this.canvasPos
			, area = e.target
			, ras = this.parseRaster(area.innerHTML);
		;
		m.start.x = e.clientX + ras.x;
		m.start.y = e.clientY + ras.y;
		this.dragRect = ras;
		this.target.element = e.target;
		
	},
	dragRasterGrip: function(e){
		var m = this.canvasPos
			, ras = this.dragRect
			, bg = this.getScrollByChild(this.target.element)
			, x, y, ls = this.lineSnapPosition
			, htm
			, shift = e.shiftKey
			, ctrl = e.ctrlKey
			, area = this.target.element
		;
			if(bg == null){
				return;
			}
		m.end.x = e.clientX + ras.x + ras.x;
		m.end.y = e.clientY + ras.y + ras.y;
		x = m.end.x - m.start.x;
		y = m.end.y - m.start.y;
		x = ctrl ? x - (x % 8) : x;
		y = ctrl ? y - (y % 8) : y;
		if(shift){
			x = Math.abs(x - ras.x) > Math.abs(y - ras.y) ? x: ras.x;
			y = Math.abs(y - ras.y) > Math.abs(x - ras.x) ?  y : ras.y;
		}
		htm = [ras.line, x, y, ras.h].join(' ');
//		console.log(ras);
		if(e.clientX == 0 && e.clientY == 0){
			return;
		}
		area.innerHTML = htm;
		this.updateRaster(bg, htm);		
	},
	dragEndRasterGrip: function(e){
		var htm
			, bg = this.getScrollByChild(this.target.element)
//			, htm = e.target.innerHTML
		;
		if(bg == null){
			return;
		}
		this.target.element = null;
		this.refreshRasterCode();
	},
	
	sceneDrawRectCursor: function (info) {
		var p = info.params
				, click = p.position
				, chips = this.charaChips
				, c1
				, top = click.start.y < click.end.y ? click.start.y : click.end.y
				, bottom = click.start.y < click.end.y ? click.end.y : click.start.y
				, x, scr = SCROLL.sprite
				;
		if (info.count % 16 < 8) {
			c1 = p.side == 1 ? chips.rectstart_1 : chips.rectstart_2;
		} else {
			c1 = p.side == 1 ? chips.rectstart_1p : chips.rectstart_2p;
		}
		x = p.side == 1 ? 0 : scr.getSize().w - CTO(1);
		SCROLL.sprite.drawSprite(c1.vflip(false), x, top);
		SCROLL.sprite.drawSprite(c1.vflip(true), x, bottom - CTO(1));

	},
	sceneKeychek: function (info) {
		var p = info.params
				, state = this.keyboard.getState(['ctrl', 'shift'])
//				, m = this.mousePos
				;
		this.isGridSnap = state.ctrl;
		if (state.shift) {
//			this.lineSnapPosition = {x: m.end.x, y: m.end.y};
		} else {
			this.lineSnapPosition = null;
		}
		keyStateCheck();
	},
	refreshRasterCode: function () {
		var code = []
				, self = this
				;
		Array.prototype.forEach.call(getEles('.raster-rect-block'), function (a, i) {
			var scr1 = a.querySelector('.raster-query')
					, scr = scr1.className.indexOf('bg1') >= 0 ? 'bg1' : 'bg2'
					, codes = self.makeRasterCodes(scr1.innerText, self.getScrollSideByName(scr1.className))
				;
			code[i] = codes.start + "\n" + codes.end;
		});

		getEles('#raster-code')[0].value = code.join("\n");
	},
	main: function () {
		var self = this
			, k
		;

		for (k in this.scenes) {
			this.scenes[k].transition(this);
		}

		drawCanvasStacks();
		SCROLL.bg1.rasterto(SCROLL.tmp);
		SCROLL.bg2.rasterto(SCROLL.tmp);
		SCROLL.sprite.rasterto(SCROLL.tmp);
		SCROLL.tmp.nearestTo(SCROLL.screen);
		SCROLL.sprite.clear();
		SCROLL.tmp.clear(COLOR_LGRAY);

		requestAnimationFrame(function () {
			self.main();
		});
	}

};
//function sampleAOnDragStart(e){
//	e.dataTransfer.setData( "Text", e.target.id );
//}
window.addEventListener('DOMContentLoaded', function () {
	var SIM = new RasterScrollSimulator()

			;
	SIM.init();

}, false);