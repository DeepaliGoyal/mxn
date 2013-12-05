if (typeof MQA.TileMap === 'undefined') {
	throw new Error(api + ' map script not imported');
}

MQA.withModule('htmlpoi', 'shapes', function() {
			// Force Early Loading all modules that can't be loaded on-demand
		
mxn.register('mapquestv7', {	

Mapstraction: {
	
	init: function(element, api, properties) {
		var me = this;
		
		if (typeof MQA.TileMap === 'undefined') {
			throw new Error(api + ' map script not imported');
		}

		this._fireOnNextCall = [];
		this._fireQueuedEvents =  function() {
			var fireListCount = me._fireOnNextCall.length;
			if (fireListCount > 0) {
				var fireList = me._fireOnNextCall.splice(0, fireListCount);
				var handler;
				while ((handler = fireList.shift())) {
					handler();
				}
			}
		};
		
		var options = {
			elt: element,
			mtype: 'map'
		};

		var map = new MQA.TileMap(options);
		this.maps[api] = map;
		this.loaded[api] = true;

		MQA.EventManager.addListener(map, 'click', function(e) {
			me.click.fire();
		});
	
		MQA.EventManager.addListener(map, 'zoomend', function(e) {
			me.changeZoom.fire();
		});

		MQA.EventManager.addListener(map, 'moveend', function(e) {
			me.endPan.fire();
		});
	
		me._fireOnNextCall.push(function() {
			me.load.fire();
		});
	},
	
	getVersion: function() {
		// Code Health Warning: MapQuest puts MQTOOLKIT_VERSION into the global namespace;
		// this could prove fun if including both MapQuest (proprietary) and MapQuest (open)
		// APIs into the same source file but specifying differing versions of both API. Yuck.
		return MQTOOLKIT_VERSION;
	},
	
	enableScrollWheelZoom: function () {
	    this._fireQueuedEvents();
	    var map = this.maps[this.api];
	    MQA.withModule('mousewheel', function () {
	        map.enableMouseWheelZoom();
	    });
	},

	disableScrollWheelZoom: function () {
	    this._fireQueuedEvents();
	    var map = this.maps[this.api];
	    MQA.withModule('mousewheel', function () {
	        map.disableMouseWheelZoom();
	    });
	},

	enableDragging: function () {
	    this._fireQueuedEvents();
        //TODO
	},

	disableDragging: function () {
	    this._fireQueuedEvents();
	    //TODO
	},

	enableDoubleClickZoom: function () {
	    this._fireQueuedEvents();
	    //TODO
	},

	disableDoubleClickZoom: function () {
	    this._fireQueuedEvents();
        //TODO
	},

	resizeTo: function(width, height){	
		this._fireQueuedEvents();
		this.currentElement.style.width = width;
		this.currentElement.style.height = height;
	},

	addControl: function (control, placement) {
        //TODO a switch statement on the control placement 
	    var map = this.maps[this.api];
	    map.addControl(
            control,
            placement || new MQA.MapCornerPlacement(MQA.MapCorner.TOP_RIGHT)
        );
	    return control;
	},

	removeControl: function (control) {
	    this.maps[this.api].removeControl(control);
	},

	addSmallControls: function() {
		this._fireQueuedEvents();
		var me = this;

		MQA.withModule('smallzoom', function () {
		    me.controls.zoom = me.addControl(new MQA.SmallZoom(), new MQA.MapCornerPlacement(MQA.MapCorner.TOP_LEFT, new MQA.Size(5,5)));

		});
	},

	removeSmallControls: function () {
	    this.removeControl(this.controls.zoom);
	},

	addLargeControls: function() {
	    this._fireQueuedEvents();
	    var me = this;

	    MQA.withModule('largezoom', function () {
	        me.controls.zoom = me.addControl(new MQA.LargeZoom(), new MQA.MapCornerPlacement(MQA.MapCorner.TOP_LEFT, new MQA.Size(5,5)));
	    });
	},

	removeLargeControls: function () {
	    this.removeSmallControls();
	},

	addMapTypeControls: function() {
	    this._fireQueuedEvents();
	    var me = this;

	    MQA.withModule('viewoptions', function () {
	        me.controls.zoom = me.addControl(new MQA.ViewOptions());
	    });
	},

	removeMapTypeControls: function () {
	    this.removeControl(this.controls.map_type);
	},

	addScaleControls: function () {
	    this._fireQueuedEvents();
	    var me = this;
        /* TODO
	    MQA.withModule('viewoptions', function () {
	        me.controls.scale = me.addControl(new MQA.ViewOptions());
	    }); */
	},

	removeScaleControls: function () {
	    this.removeControl(this.controls.scale);
	},

	addPanControls: function () {
	    this._fireQueuedEvents();
	    var me = this;
	    /* TODO
	    MQA.withModule('viewoptions', function () {
	        me.controls.pan = me.addControl(new MQA.ViewOptions());
	    }); */
	},

	removePanControls: function () {
	    this.removeControl(this.controls.pan);
	},

	addOverviewControls: function (zoomOffset) {
	    this._fireQueuedEvents();
	    var me = this;
	    var options = {
	        size: { width: 150, height: 125 },
	        zoom: 3,
	        mapType: 'map',
	        minimized: false
	    };

	    MQA.withModule('insetmapcontrol', function () {
	        me.controls.overview = me.addControl(new MQA.InsetMapControl(options), new MQA.MapCornerPlacement(MQA.MapCorner.BOTTOM_RIGHT));
	    });
	},

	removeOverviewControls: function () {
	    this.removeControl(this.controls.overview);
	},

	setCenterAndZoom: function(point, zoom) { 
		this._fireQueuedEvents();

		// The order of setting zoom and center is critical and peculiar to the way in which
		// the MapQuest API seems to work (which is based on trial, error and reverse engineering)
		//
		// Or .. to quote @gilesc50 "don’t mess with this, its deliberately nuts"

		this.setZoom(zoom);
		this.setCenter(point);
	},
	
	addMarker: function(marker, old) {
		this._fireQueuedEvents();
		var map = this.maps[this.api];
		var pin = marker.toProprietary(this.api);
		
		map.addShape(pin);
		
		return pin;
	},

	removeMarker: function(marker) {
		this._fireQueuedEvents();
		var map = this.maps[this.api];
		map.removeShape(marker.proprietary_marker);
	},
	
	declutterMarkers: function(opts) {
		this._fireQueuedEvents();

		throw new Error('Mapstraction.declutterMarkers is not currently supported by provider ' + this.api);
	},

	addPolyline: function(polyline, old) {
		this._fireQueuedEvents();
		var map = this.maps[this.api];
		var mapquest_polyline = polyline.toProprietary(this.api);

		map.addShape(mapquest_polyline);
		
		return mapquest_polyline;
	},

	removePolyline: function(polyline) {
		this._fireQueuedEvents();
		var map = this.maps[this.api];
		
		map.removeShape(polyline.proprietary_polyline);
	},
	
	getCenter: function() {
		this._fireQueuedEvents();
		var map = this.maps[this.api];
		var point = map.getCenter();
		
		return new mxn.LatLonPoint(point.lat, point.lng);
	},

	setCenter: function(point, options) {
		this._fireQueuedEvents();
		var map = this.maps[this.api];
		var pt = point.toProprietary(this.api);
		map.setCenter(pt);
	},

	setZoom: function(zoom) {
		this._fireQueuedEvents();
		var map = this.maps[this.api];
		map.setZoomLevel(zoom);
	},
	
	getZoom: function() {
		this._fireQueuedEvents();
		var map = this.maps[this.api];
		var zoom = map.getZoomLevel();
		
		return zoom;
	},

	getZoomLevelForBoundingBox: function( bbox ) {
		this._fireQueuedEvents();
		
		throw new Error('Mapstraction.getZoomLevelForBoundingBox is not currently supported by provider ' + this.api);
	},

	setMapType: function(type) {
		this._fireQueuedEvents();
		var map = this.maps[this.api];
		
		switch (type) {
			case mxn.Mapstraction.SATELLITE:
				map.setMapType('sat');
				break;
			case mxn.Mapstraction.HYBRID:
				map.setMapType('hyb');
				break;
			case mxn.Mapstraction.PHYSICAL:
				map.setMapType('map');
				break;
			case mxn.Mapstraction.ROAD:
				map.setMapType('map');
				break;
			default:
				map.setMapType('map');
				break;
		}
	},

	getMapType: function() {
		this._fireQueuedEvents();
		var map = this.maps[this.api];
		
		var type = map.getMapType();
		switch(type) {
			case 'sat':
				return mxn.Mapstraction.SATELLITE;
			case 'hyb':
				return mxn.Mapstraction.HYBRID;
			case 'map':
				return mxn.Mapstraction.ROAD;
			default:
				return mxn.Mapstraction.ROAD;
		}
	},

	getBounds: function () {
		this._fireQueuedEvents();
		var map = this.maps[this.api];
		var rect = map.getBounds();
		var se = rect.lr;
		var nw = rect.ul;
		// MapQuest uses SE and NW points to declare bounds
		return new mxn.BoundingBox(se.lat, nw.lng, nw.lat, se.lng);
	},

	setBounds: function(bounds){
		this._fireQueuedEvents();
		var map = this.maps[this.api];
		var sw = bounds.getSouthWest();
		var ne = bounds.getNorthEast();
		
		// MapQuest uses SE and NW points to declare bounds
		var rect = new MQA.RectLL(new MQA.LatLng(sw.lat, ne.lon), new MQA.LatLng(ne.lat, sw.lon));
		map.zoomToRect(rect);
	},

	addImageOverlay: function(id, src, opacity, west, south, east, north, oContext) {
		this._fireQueuedEvents();

		throw new Error('Mapstraction.addImageOverlay is not currently supported by provider ' + this.api);
	},

	setImagePosition: function(id, oContext) {
		this._fireQueuedEvents();

		throw new Error('Mapstraction.setImagePosition is not currently supported by provider ' + this.api);
	},
	
	addOverlay: function(url, autoCenterAndZoom) {
		this._fireQueuedEvents();

		throw new Error('Mapstraction.addOverlay is not currently supported by provider ' + this.api);
	},

	getPixelRatio: function() {
		this._fireQueuedEvents();

		throw new Error('Mapstraction.getPixelRatio is not currently supported by provider ' + this.api);
	},
	
	mousePosition: function(element) {
		this._fireQueuedEvents();

		var locDisp = document.getElementById(element);
		
		if (locDisp !== null) {
			var mapDiv = document.getElementById(this.element);
			var map = this.maps[this.api];
			var isIE = MQA.Util.getBrowserInfo().name == 'msie';
			var offsetX = mapDiv.offsetLeft - mapDiv.scrollLeft;
			var offsetY = mapDiv.offsetTop - mapDiv.scrollTop;
		
			locDisp.innerHTML = '0.0000 / 0.0000';
			mapDiv.onmousemove = function(evt) {
				var x = isIE ? evt.clientX : evt.pageX - offsetX;
				var y = isIE ? evt.clientY : evt.pageY - offsetY;
				var coords = map.pixToLL({x:x, y:y});
				locDisp.innerHTML = coords.lat.toFixed(4) + '/' + coords.lng.toFixed(4);
			};
		}
	}
	
},

LatLonPoint: {
	
	toProprietary: function() {
		return new MQA.LatLng(this.lat, this.lon);
	},

	fromProprietary: function(mqPoint) {
		this.lat = mqPoint.getLatitude();
		this.lon = mqPoint.getLongitude();
	}
},

Marker: {
	
	toProprietary: function() {
			var pt = this.location.toProprietary(this.api);
			var mk = null;
			
			if (this.htmlContent) {
					mk = new MQA.HtmlPoi(pt);
					
					/*MQA.HtmlPois will have their upper left corner placed with the lat/lng provided in the 
					constructor. Use setHTML to provide valid HTML for your POI, xOffset, yOffset and a	 CSS class name for your div.*/ 
					var offset = this.iconAnchor ? this.iconAnchor : [0,0];
					mk.setHtml(this.htmlContent, -offset[0], -offset[1], 'none');
			} 
			else {
				mk = new MQA.Poi(pt);
				 
				if (this.iconUrl) {
					var icon = new MQA.Icon(this.iconUrl, this.iconSize[0], this.iconSize[1]);
					mk.setIcon(icon);
				}			 
			}
					
			if (this.infoBubble) {
				mk.setInfoContentHTML(this.infoBubble);
			}
			
			MQA.EventManager.addListener(mk, 'click', function() {
				mk.mapstraction_marker.click.fire();
			});
			
			return mk;
	},

	openBubble: function() {
		if (this.infoBubble) {
			this.proprietary_marker.setInfoContentHTML(this.infoBubble);
			if (!this.proprietary_marker.infoWindow) {
				this.proprietary_marker.toggleInfoWindow ();
			}
			else {
				// close
			}
			this.openInfoBubble.fire( { 'marker': this } );
		}
	},

	closeBubble: function() {
		if (!this.proprietary_marker.infoWindow) {
			// open
		}
		else {
			this.proprietary_marker.toggleInfoWindow ();
		}
		this.closeInfoBubble.fire( { 'marker': this } );
	},
	
	hide: function() {
		this.proprietary_marker.setVisible(false);
	},

	show: function() {
		this.proprietary_marker.setVisible(true);
	},

	update: function() {
		throw new Error('Marker.update is not currently supported by provider ' + this.api);
	}
	
},

Polyline: {

	toProprietary: function() {
		var coords = [];
		
		for (var i=0, length=this.points.length; i < length; i++) {
			coords.push(this.points[i].lat);
			coords.push(this.points[i].lon);
		}

		if (this.closed) {
			if (!(this.points[0].equals(this.points[this.points.length - 1]))) {
				coords.push(this.points[0].lat);
				coords.push(this.points[0].lon);
			}
		}

		else if (this.points[0].equals(this.points[this.points.length - 1])) {
			this.closed = true;
		}

		if (this.closed) {
			this.proprietary_polyline = new MQA.PolygonOverlay();
			this.proprietary_polyline.color = this.color;
			this.proprietary_polyline.fillColor = this.fillColor;
			this.proprietary_polyline.fillColorAlpha = this.opacity;
			this.proprietary_polyline.colorAlpha = this.opacity;
			this.proprietary_polyline.borderWidth = this.width;
		}
		
		else {
			this.proprietary_polyline = new MQA.LineOverlay();
			this.proprietary_polyline.color = this.color;
			this.proprietary_polyline.colorAlpha = this.opacity;
			this.proprietary_polyline.borderWidth = this.width;
		}

		this.proprietary_polyline.setShapePoints(coords);

		return this.proprietary_polyline;
	},
	
	show: function() {
		this.proprietary_polyline.visible = true;
	},

	hide: function() {
		this.proprietary_polyline.visible = false;
	}
}

});

});