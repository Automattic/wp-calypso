/** @format */

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
