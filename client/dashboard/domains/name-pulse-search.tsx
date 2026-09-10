import config from '@automattic/calypso-config';
import { __ } from '@wordpress/i18n';
import Notice from '../components/notice';

export default function NamePulseSearch() {
	if ( ! config.isEnabled( 'domain-search/name-pulse' ) ) {
		return null;
	}

	return (
		<Notice variant="info" title={ __( 'Name Pulse search' ) }>
			{ __( 'The new domain search experience is enabled for this environment.' ) }
		</Notice>
	);
}
