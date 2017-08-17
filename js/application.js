var projectMap = (function (window, $) {
	var publicVars = {
		'map': null,
		'resources': {
			'intersections': function(){
				return $.get('https://spreadsheets.google.com/feeds/list/1GWulkFtMQVDwQIUKQFMB7n8lLP44yNBFphS_l-qhlrY/1/public/basic?alt=json');
			}
		},
		'intersectionMarkers': [],
        'assets': {
        	'basemarker': '<?xml version="1.0" encoding="UTF-8" standalone="no"?><svg xmlns:svg="http://www.w3.org/2000/svg" xmlns="http://www.w3.org/2000/svg" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape" width="16" height="16" id="svg2" version="1.1"><path d="m 15.75,8.0000013 c 0,4.2802067 -3.469793,7.7499997 -7.75,7.7499997 -4.2802068,0 -7.75,-3.469793 -7.75,-7.7499997 0,-4.2802068 3.4697932,-7.74999998 7.75,-7.74999998 4.280207,0 7.75,3.46979318 7.75,7.74999998 z" style="fill:marker-color-here;fill-opacity:1;stroke:none"/></svg>'
        },
        'bubble': new google.maps.InfoWindow	
	};
	function _init(){
        publicVars.map = new google.maps.Map(document.getElementById('map-container'), {
          center: new google.maps.LatLng(45, -100),
          zoom: 5,
          mapTypeId: google.maps.MapTypeId.ROADMAP
        });

        google.maps.event.addListenerOnce(publicVars.map, 'idle', function(){
			_getIntersections();
        });
        google.maps.event.addListener(publicVars.map, 'click', function(){
        	publicVars.bubble.close();
        }); 
        $('.btn-rankings').on('click', function(e){
        	e.preventDefault();
			publicVars.intersectionMarkers.reverse();
			publicVars.bubble.close();
			$('.sort-order').toggleClass('glyphicon-triangle-bottom glyphicon-triangle-top');
        	_createSidebarEntries();
        });       
	}
	function _getIntersections(){
		$.when(
			publicVars.resources.intersections()
		)
		.done(function(data){
        	var entries = [];
        	for(i in data.feed.entry){
        		var obj = {};
        		var item = data.feed.entry[i];
        		var particles = item.content.$t.split(",");
        		for(j in particles){
        			var d = particles[j].split(":");
        			if( $.isNumeric( $.trim(d[1]) ) ){
						obj[$.trim(d[0])] = parseFloat($.trim(d[1]));
        			}
        			else
        			{
        				obj[$.trim(d[0])] = $.trim(d[1]);	
        			}
        			
        		}
        		entries.push(obj);
        	}
        	console.log(entries);
        	publicVars.intersections = entries.slice();
        	_displayIntersections();
        	_zoomToIntersectionExtent();
        	_createSidebarEntries();
		});
	}
	function _createBubble(marker){
			google.maps.event.addListener(marker, 'click', function(){
				//if( publicVars.bubble.isOpen() ){
					publicVars.bubble.close();							
				//}
				publicVars.bubble.setContent('<div><h1 style="font-size:18px;margin-left:15px;">Intersection stats</h1><ul><li>Name: ' + publicVars.intersectionMarkers[i].intersections + '</li><li># of Accidents: ' + publicVars.intersectionMarkers[i].accidentcount + '</li><li>Rank: ' + publicVars.intersectionMarkers[i].rank + '</li><li>Latitude: ' + publicVars.intersectionMarkers[i].latitude + '</li><li>Longitude: ' + publicVars.intersectionMarkers[i].longitude + '</li></ul></div>');
				publicVars.bubble.open(publicVars.map, marker);
			});
	}
	function _displayIntersections(){
		for(i in publicVars.intersections){
			var marker = new google.maps.Marker({
				'map': publicVars.map,
				'position': new google.maps.LatLng(publicVars.intersections[i].latitude, publicVars.intersections[i].longitude),
				'title': publicVars.intersections[i].intersections,
				'icon': {
					'url': 'data:image/svg+xml,' + publicVars.assets.basemarker.split('marker-color-here').join('#FF0000'),
					'size': new google.maps.Size(16, 16),
					'scaledSize': new google.maps.Size(16, 16),
					'anchor': new google.maps.Point(8, 8)        						
        		}
			});
			marker.setOptions($.extend(true, {}, publicVars.intersections[i]));
			_createBubble(marker);
			publicVars.intersectionMarkers.push(marker);
		}		
	}
	function _createSidebarEntries(){
		$('.down').html('');
		for(i in publicVars.intersectionMarkers){
			$('.down').append('<li class="row"><div class="col-xs-7 col-sm-7 col-md-7 col-lg-7"><a href="#" class="sidebar-item" data-intersectionid="' + publicVars.intersectionMarkers[i].id + '" title="'+ publicVars.intersectionMarkers[i].intersections +'">' + publicVars.intersectionMarkers[i].intersections + '</a></div><div class="col-xs-2 col-sm-2 col-md-2 col-lg-2 text-center"><span class="rank-txt">' + publicVars.intersectionMarkers[i].rank + '</span></div><div class="col-xs-3 col-sm-3 col-md-3 col-lg-3 text-center"><span class="acc-txt">' + publicVars.intersectionMarkers[i].accidentcount + '</span></div></li>')
		}
		$('.down').find('a').each(function(index, elem){
			$(elem).on('click', function(e){
				e.preventDefault();
				//alert( $(this).attr('data-intersectionid') );
				for(i in publicVars.intersectionMarkers){
					if( publicVars.intersectionMarkers[i].id == $(this).attr('data-intersectionid') ){
						google.maps.event.trigger(publicVars.intersectionMarkers[i], 'click');
					}
				}
			});
		});
	}
	function _zoomToIntersectionExtent(){
		var bounds = new google.maps.LatLngBounds();
		for(i in publicVars.intersections){
			bounds.extend(new google.maps.LatLng(publicVars.intersections[i].latitude, publicVars.intersections[i].longitude));
		}
		if( !bounds.isEmpty() ){
			publicVars.map.fitBounds(bounds);
		}		
	}
	return {
		init: _init
	}
})(window, jQuery);
