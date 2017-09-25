/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import React from 'react';

/**
 * Internal dependencies
 */
import EmptyContent from 'components/empty-content';
import config from 'config';

const NoSitesMessage = ( { translate } ) => {
	return (
		<EmptyContent
			title={ translate( "You don't have any WordPress sites yet." ) }
			line={ translate( 'Would you like to start one?' ) }
			action={ translate( 'Create Site' ) }
			actionURL={ config( 'signup_url' ) + '?ref=calypso-nosites' }
			illustration={ '/calypso/images/illustrations/illustration-nosites.svg' }
		/>
	);
};

export default localize( NoSitesMessage );
