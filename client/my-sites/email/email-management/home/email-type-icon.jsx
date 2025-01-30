import { Gridicon } from '@automattic/components';
import { localize } from 'i18n-calypso';
import emailForwardingIcon from 'calypso/assets/images/email-providers/forwarding.svg';
import googleWorkspaceIcon from 'calypso/assets/images/email-providers/google-workspace/icon.svg';
import { hasEmailForwards } from 'calypso/lib/domains/email-forwarding';
import { hasGSuiteWithUs } from 'calypso/lib/gsuite';
import { hasTitanMailWithUs } from 'calypso/lib/titan';

const EmailTypeIcon = ( { translate, domain } ) => {
	if ( hasTitanMailWithUs( domain ) ) {
		// The my-sites SVG has a bit of extra padding on the left, so we need to adjust the position
		return <Gridicon style={ { marginLeft: -3 } } icon="my-sites" size={ 36 } />;
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
