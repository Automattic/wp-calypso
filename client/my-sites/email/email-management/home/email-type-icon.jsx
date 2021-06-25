/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import googleWorkspaceIcon from 'calypso/assets/images/email-providers/google-workspace/icon.svg';
import emailForwardingIcon from 'calypso/assets/images/email-providers/forwarding.svg';
import { hasTitanMailWithUs } from 'calypso/lib/titan';
import { hasGSuiteWithUs } from 'calypso/lib/gsuite';
import { hasEmailForwards } from 'calypso/lib/domains/email-forwarding';
import Gridicon from 'calypso/components/gridicon';

const EmailTypeIcon = ( { translate, domain } ) => {
	if ( hasTitanMailWithUs( domain ) ) {
		return <Gridicon icon="my-sites" size={ 36 } />;
	}

	if ( hasGSuiteWithUs( domain ) ) {
		return <img src={ googleWorkspaceIcon } alt={ translate( 'Google Workspace icon' ) } />;
	}

	if ( hasEmailForwards( domain ) ) {
		return <img src={ emailForwardingIcon } alt={ translate( 'Email Forwarding icon' ) } />;
	}

	return null;
};

export default localize( EmailTypeIcon );
