import { __ } from '@wordpress/i18n';
import RouterLinkSummaryButton from '../../components/router-link-summary-button';
import type { Domain } from '../../data/types';
import type { Density } from '@automattic/components/src/summary-button/types';

export default function NameServersSettingsSummary( {
	domain,
	density,
}: {
	domain: Domain;
	density?: Density;
} ) {
	let badges = [];
	if ( domain.has_wpcom_nameservers ) {
		badges = [ { text: __( 'Using WordPress.com name servers' ), intent: 'success' as const } ];
	} else {
		badges = [ { text: __( 'Using custom name servers' ), intent: 'warning' as const } ];
	}

	return (
		<RouterLinkSummaryButton
			to={ `/domains/${ domain.domain }/name-servers` }
			title={ __( 'Name servers' ) }
			density={ density }
			badges={ badges }
		/>
	);
}
