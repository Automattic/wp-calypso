/**
 * External dependencies
 */

import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import config from 'calypso/config';
import EmptyContent from 'calypso/components/empty-content';

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
