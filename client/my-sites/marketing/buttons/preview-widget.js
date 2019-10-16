/**
 * External dependencies
 */
import { stringify } from 'qs';
import { translate } from 'i18n-calypso';

const baseUrl = '//widgets.wp.com/sharing-buttons-preview/';

export default {
	generatePreviewUrlFromButtons: function( buttons, showMore ) {
		let numberOfCustomButtons = 0;
		const query = {};

		// Build the query parameter array of services names to be rendered
		// by the official sharing buttons preview widget
		buttons.forEach( function( button ) {
			let index;

			if ( button.custom ) {
				// Custom buttons previews are specified by index using the
				// name and a URL to the icon
				index = numberOfCustomButtons++;
				query[ 'custom[' + index + '][name]' ] = encodeURIComponent( button.name );
				query[ 'custom[' + index + '][icon]' ] = encodeURIComponent( button.icon );
			} else {
				query[ 'service[]' ] = query[ 'service[]' ] || [];
				query[ 'service[]' ].push( button.ID );
			}
		} );

		if ( showMore ) {
			query.more = translate( 'More' );
		}

		return baseUrl + '?' + stringify( query );
	},
};
