export const bumpStat = ( group, name ) => {
	let uriComponent = '';

	if ( undefined === group ) {
		return;
	}

	if ( typeof group === 'object' ) {
		for ( const key in group ) {
			if ( typeof group[ key ] === 'string' ) {
				uriComponent +=
					'&x_' + encodeURIComponent( key ) + '=' + encodeURIComponent( group[ key ] );
			}
		}
	} else if ( typeof group === 'string' && typeof name === 'string' ) {
		uriComponent = '&x_' + encodeURIComponent( group ) + '=' + encodeURIComponent( name );
	}

	if ( uriComponent.length ) {
		new Image().src =
			document.location.protocol +
			'//pixel.wp.com/g.gif?v=wpcom-no-pv' +
			uriComponent +
			'&baba=' +
			Math.random();
	}
};
