import { __ } from '@wordpress/i18n';
import RouterLinkSummaryButton from '../../components/router-link-summary-button';
import type { Domain } from '../../data/types';

export default function NameServersSettingsSummary( { domain }: { domain: Domain } ) {
	let badges = [];
	if ( domain.has_wpcom_nameservers ) {
		badges = [ { text: __( 'Using WordPress.com name servers' ), intent: 'success' as const } ];
	} else {
		badges = [ { text: __( 'Using custom name servers' ), intent: undefined } ];
	}

	return (
		<RouterLinkSummaryButton
			to={ `/domains/${ domain.domain }/name-servers` }
			title={ __( 'Name servers' ) }
			badges={ badges }
			density={ 'medium' as const }
		/>
	);
}
