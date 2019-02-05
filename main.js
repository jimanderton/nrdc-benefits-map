
(function(){
	var map,
		layerState,
		layerCounty,
		layerSel,
		counties_geojson,
		states_geojson,
		baseZoom,
		dataset_id = 'benavomort20',
		infoPanel,
		panel_open = false,
		prev_bounds,
		selectedFtr,
		colorFn,
		legend,
		$select;
	
	// Create map
	map = L.map('map-container', {renderer: L.canvas(), preferCanvas: true})
		.setView([39.8283, -98.5795], 4)
		.setMaxBounds(L.latLngBounds(L.latLng(50, -61), L.latLng(19, -127)));
	map.attributionControl.addAttribution('Map created by <A HREF="https://www.indecon.com/" TARGET="_blank">Industrial Economics Incorporated</A>');
	map.attributionControl.addAttribution('Powered by <A HREF="http://esri.maps.arcgis.com/home/index.html" TARGET="_blank">Esri</A>');
	
	// Add the legend control
	legend = L.control({position: 'bottomleft'});
	legend.onAdd = function (map) {
	    var div = L.DomUtil.create('div', 'map-ctrl legend'),
	    	scale = colorFn.classes(),
	    	txt,
	    	lowval,
	    	highval,
	    	option = cb_2016_options.filter(function(o){return o.ref_id === dataset_id})[0];
	    
	    for (var x = 0, y = scale.length - 1; x<y; x++) {
	    	lowval = x === 0 ? '' : __formatVal(scale[x]);
	    	highval = x === y - 1 ? '' : __formatVal(scale[x + 1] - (Math.pow(10, -1 * option.decimal_places)));
	    	txt = lowval == '' ? '&lt;=&nbsp;' + highval : (highval == '' ? lowval + '&nbsp;+' : lowval + '&nbsp;&ndash;&nbsp;' + highval);
	        div.innerHTML += '<div><i style="background-color:' + colorFn(scale[x]) + '"></i> ' + txt + '</div>';
	    }
	    if (!$select) _buildSelect();
	    $(div).prepend($select);
	    return div;
	    
	    function __formatVal(val) {
	    	return (option.currency ? '$' : '') + val.toLocaleString();
	    }
	};

	
	// Add the base layer
	L.tileLayer('https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/{id}/MapServer/tile/{z}/{y}/{x}', {
	    attribution: 'Tile Layer by <A HREF="http://esri.maps.arcgis.com/home/index.html" TARGET="_blank">Esri</A>',
	    minZoom: 4,
	    maxZoom: 16,
	    id: 'World_Light_Gray_Base'
	}).addTo(map);
	
	// Figure out the color ranges for our county layer and legend
	_setChromaRanges();
	
	// Get the TopoJSON for our counties and states and convert it to GeoJSON
	counties_geojson = topojson.feature(topo_data, topo_data.objects['cb_2016_us_county_500k']);
	states_geojson = topojson.feature(topo_data, topo_data.objects['states']);
	
	//Add the 48 states outline
	layerState = L.geoJson(states_geojson, {style: styles['state']}).addTo(map);
	
	//Add the counties to the map
	layerCounty = L.geoJson(counties_geojson, {
		style: _countyStyle,
		onEachFeature: function(feature, layer) {
		    layer.on({
		        mouseover: _highlightFeature,
		        mouseout: _resetHighlight,
		        click: _selectFeatureFromMap
		    });
		}
	}).addTo(map);	
	
	// Build the slide reveal
	infoPanel = $("#info-panel").slideReveal({
		trigger: $("#trigger"),
		push: false,
		position: "right",
		width: 450,
		speed: 500,
		hide: function(p, o) { p.removeClass('panel-shadow'); },
		hidden: _closePanel,
		show: function(p, o) { p.addClass('panel-shadow'); },
		shown: function() { panel_open = true;}
	});
	
	$('#info-panel .close-button').on('click', function(){$('#info-panel').slideReveal('hide');})
	
	_initTypeahead();
	
	
		
	
	function _setChromaRanges() {
		var data = cb_2016_data[dataset_id],
			vals = [],
			ranges = [],
			option;
		option = cb_2016_options.filter(function(o){return o.ref_id === dataset_id})[0];
		for (key in data) {
			vals.push(data[key]);
		}
		vals.sort(function(a, b){return a - b});
		// Let chroma take a first pass at our numbers and break them into ranges
		ranges = chroma.limits(vals, 'q', scale_color_count);
		// Now round those ranges off to avoid insane decimal placements
		ranges = ranges.map(function(o) {
			return Number(o.toFixed(o >= 10 ? 0 : 1));
		});
		
		colorFn = chroma.scale(option.chroma_scale).classes(ranges);
		
		if (!!legend) legend.remove();
		legend.addTo(map);
	}	
	
	function _countyStyle(feature) {
		return Object.assign({fillColor: _getColor(feature.properties.GEOID)}, styles['county']);
	}

	function _getColor(county_id) {
		var data = cb_2016_data[dataset_id],
			val = data[county_id];

		return colorFn(val).hex();
	}	
	
	function _highlightFeature(e) {
	    var layer = e.target;
	    layer.setStyle(styles['highlight']);
	    layer.bringToFront();
	}

	function _resetHighlight(e) {
		var layer = e.target;
	    layerCounty.resetStyle(layer);
	}

	function _selectFeatureFromMap(e) {
		_selectFeature(e.target.feature);
	}
	
	function _selectFeature(ftr) {
	    selectedFtr = ftr;
	    var geoid = ftr.properties['GEOID'];
	    // If the side panel hasn't been opened then store the current bounds
	    if (!panel_open) prev_bounds = map.getBounds();
		// Remove the previous selected layer if one exists
		if (!!layerSel) layerSel.remove();
		// Now create a new layer from the geometry
		layerSel = L.GeoJSON.geometryToLayer(ftr.geometry)
		.setStyle(Object.assign({fillColor: _getColor(geoid)}, styles['selected']))
		.addTo(map);
		// Bring it to the front so it stays visible
		layerSel.bringToFront();
		// Fly to the selected feature
		map.flyToBounds(layerSel.getBounds(),{paddingBottomRight: [450, 0], maxZoom: 8});
		// Get the county data and open the side panel
		$.get('./data/counties/' + geoid + '.json', _displayInfoPanel);
	}
	
	function _buildSelect() {
		$select = $('<select id="dataset-sel"></select>');
		cb_2016_options.forEach(
			function(o) {
				$select.append('<OPTION value="' + o.ref_id + '">' + o.name);
			}
		);
		$select.on('change', function() {
			dataset_id = this.value;
			_setChromaRanges();
			layerCounty.clearLayers();
			layerCounty.addData(counties_geojson);
		});
		
	}
	
	function _initTypeahead() {
		// Create an array of the counties with State Abbreviations appended (for duplicate names)
		var counties = counties_geojson.features.map(
			function(o) {
				var props = o.properties;				
				var state_id = props.GEOID.slice(0,2);
				var state_abbrev = state_codes[state_id].abbrev;
				var cty_name = _fullCountyTitle(o) + ' (' + state_abbrev + ')';
				return {'text': cty_name, 'feature': o};
			}
		);		

		var bh_engine = new Bloodhound({
		    local: counties,
		    queryTokenizer: Bloodhound.tokenizers.whitespace,
		    datumTokenizer: Bloodhound.tokenizers.obj.whitespace('text'),
		    sufficient: Infinity,
		    remote: {
		        url: arcgis_sug_url,
		        wildcard: '%TEXT',
		        rateLimitWait: 500,
		        transform: function(o) {		        	
		        	return bh_engine.sorter(o.suggestions);
		        }
	    	},
	    	sorter: function(a,b){
	    		return a.text.toUpperCase() < b.text.toUpperCase() ? -1 : 1;
	    	}
		});
				
		$('.typeahead').typeahead({
			  hint: true,
			  highlight: true,
			  minLength: 4			  
			}, {
			name: 'ctys',
			display: 'text',
			source: bh_engine,
			async: true,
			limit: Infinity
		}).bind('typeahead:select', function(ev, suggestion) {
			if (!!suggestion.feature) {
				// This is a county from our data
				_selectFeature(suggestion.feature);
			} else {
				// This is an item from arcgis suggest
				var params = "SingleLine=" + suggestion.text + "&magicKey=" + suggestion.magicKey;
				$.get(arcgis_find_url + params, function(data) {
					var loc = data.candidates[0].location;
					var results = leafletPip.pointInLayer([loc.x, loc.y], layerCounty, true);
					if (results.length > 0) {
						_selectFeature(results[0].feature);
					}
				});
			};
			// Remove focus from the input field or ESC won't close the info panel
			$('.tt-input').blur();
		});
		
	}
	
	function _closePanel() {
		panel_open = false;
		// Remove the selected layer
		layerSel.remove();
		// Fly back to the previous bounds
		map.flyToBounds(prev_bounds);
	}
	
	function _displayInfoPanel(data) {
		// Populate the ui with data
		var state_id = selectedFtr.properties['GEOID'].slice(0,2);
		var $table = $('#benefits');
		var $template = $('.row-template > div');
		
		if(this.url.includes('/counties/')) {
			$('.data-container .header').text(_fullCountyTitle(selectedFtr) + ', ' + _shortStateTitle(state_id) );
			$('.data-container .toggle-link').text('View results for ' + _fullStateTitle(state_id));
			$('.data-container .toggle-link').one('click', function(){
				$.get('./data/states/' + selectedFtr.properties['GEOID'].slice(0,2) + '.json', _displayInfoPanel);
			})

		} else {
			$('.data-container .header').text(_fullStateTitle(state_id));
			$('.data-container .toggle-link').text('Return to results for ' + _fullCountyTitle(selectedFtr));
			$('.data-container .toggle-link').one('click', function(){
				$.get('./data/counties/' + selectedFtr.properties['GEOID'] + '.json', _displayInfoPanel);
			})

		}
		
		$table.find('> .t-row:not(.t-header)').remove();
		data_mapping.forEach(function(map){
			var $row = $template.clone();
			$row.find('.data-label').text(map.name);
			map.vals.forEach(function(val_map){
				var data_val = val_map.currency ? '$' + ((data[val_map.id]/1000).toFixed()*1000).toLocaleString() : data[val_map.id].toFixed(data[val_map.id] >= 10 ? 0 : 1);
				$row.find('.data-' + val_map.year + '-' + val_map.type).text(data_val);
			});
			$table.append($row);
		});
		
		// Open the side panel
		if(! panel_open) {
			infoPanel.slideReveal("show");
		}
	}
	
	function _fullCountyTitle(ftr){
		var name = ftr.properties.NAME
		var lsad = ftr.properties.LSAD;
		return name + (lsad=='00' ? '' : ' ' + lsad_codes[lsad]);
	}
	
	function _fullStateTitle(state_id){
		var state = state_codes[state_id];
		switch (state_id) {
		case '11':
		case '60':
		case '66':
		case '69':
		case '72':
		case '74':
		case '78':
			return state.name;
			break;
		}
		return "State of " + state.name;	
	}
	
	function _shortStateTitle(state_id){
		var state = state_codes[state_id];
		return state.name;
	}
	
})();
