/** @format */

/* TODO: Replace with styles created in A8C-owned account */
export function mapboxMapFormatter( map_style, map_details ) {
	const style_urls = {
		default: {
			details: 'mapbox://styles/rabberson/cjnxjme2m054v2rs2gf3nggx6',
			no_details: 'mapbox://styles/rabberson/cjnxl6xqp55kt2sk55ivay8r0',
		},
		black_and_white: {
			details: 'mapbox://styles/rabberson/cjnxjofik08ax2rmx47rfzhji',
			no_details: 'mapbox://styles/rabberson/cjnxjvlk108kq2slmjnd9beni',
		},
		satellite: {
			details: 'mapbox://styles/mapbox/satellite-streets-v10',
			no_details: 'mapbox://styles/mapbox/satellite-v9',
		},
		terrain: {
			details: 'mapbox://styles/rabberson/cjnxl0upd52ik2srtr0zh216f',
			no_details: 'mapbox://styles/rabberson/cjnxl28cc54rl2roaamgb621y',
		},
	};
	const style_url = style_urls[ map_style ][ map_details ? 'details' : 'no_details' ];
	return style_url;
}

export function googleMapFormatter( map_style, map_details ) {
	const createStyle = function(
		featureType = null,
		elementType = null,
		stylerKey = null,
		stylerValue = null
	) {
		const style = {};
		if ( featureType ) {
			style.featureType = featureType;
		}
		if ( elementType ) {
			style.elementType = elementType;
		}
		if ( stylerKey && stylerValue ) {
			const styler = {};
			styler[ stylerKey ] = stylerValue;
			style.stylers = [ styler ];
		}
		return style;
	};
	const allStyles = [];
	allStyles.push( createStyle( null, 'labels', 'visibility', map_details ? 'on' : 'off' ) );
	if ( map_details ) {
		allStyles.push( createStyle( 'labels', null, 'visibility', 'on' ) );
		allStyles.push( createStyle( 'poi', 'labels.text', 'visibility', 'simplified' ) );
		allStyles.push( createStyle( 'poi', 'labels.icon', 'visibility', 'off' ) );
	} else {
		allStyles.push( createStyle( 'poi', 'labels.text', 'visibility', 'off' ) );
		allStyles.push( createStyle( 'transit', null, 'visibility', 'off' ) );
		allStyles.push( createStyle( 'administrative', null, 'visibility', 'off' ) );
		allStyles.push( createStyle( 'road', null, 'visibility', 'off' ) );
		allStyles.push( createStyle( 'water', 'labels', 'visibility', 'off' ) );
	}
	if ( map_style === 'black_and_white' ) {
		allStyles.push( createStyle( null, null, 'saturation', -100 ) );
	}
	return allStyles;
}
