import { __ } from '@wordpress/i18n';
import RouterLinkSummaryButton from '../../components/router-link-summary-button';
import type { Domain } from '@automattic/api-core';

export default function NameServersSettingsSummary( {
	domain,
	isDisabled,
	onClick,
}: {
	domain: Domain;
	isDisabled?: boolean;
	onClick?: () => void;
} ) {
	const badges = [
		{
			text: domain.has_wpcom_nameservers
				? __( 'Using WordPress.com name servers' )
				: __( 'Using custom name servers' ),
			intent: 'draft' as const,
		},
	];

	return (
		<RouterLinkSummaryButton
			to={ `/domains/${ domain.domain }/name-servers` }
			title={ __( 'Name servers' ) }
			badges={ badges }
			density={ 'medium' as const }
			disabled={ isDisabled }
			onClick={ onClick }
		/>
	);
}
