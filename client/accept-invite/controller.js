/**
 * External Dependencies
 */
import React from 'react';

/**
 * Internal Dependencies
 */
import i18n from 'lib/mixins/i18n';
import titleActions from 'lib/screen-title/actions';
import Main from './main';

export default {
	acceptInvite( context ) {
		titleActions.setTitle( i18n.translate( 'Accept Invite', { textOnly: true } ) );

		React.unmountComponentAtNode( document.getElementById( 'secondary' ) );

		React.render(
			React.createElement( Main, context.params ),
			document.getElementById( 'primary' )
		);
	}
};
