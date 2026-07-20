import { DomainSubtype, DomainStatus } from '@automattic/api-core';
import { Link } from '@tanstack/react-router';
import { __experimentalVStack as VStack } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useAnalytics } from '../../app/analytics';
import { purchaseSettingsRoute } from '../../app/router/me';
import { Text } from '../../components/text';
import { canEnableAutoRenew } from '../../utils/domain';
import type { DomainSummary } from '@automattic/api-core';

export const DomainExpiryField = ( {
	inOverview,
	domain,
	value,
}: {
	inOverview: boolean;
	domain: DomainSummary;
	value: string;
} ) => {
	const { recordTracksEvent } = useAnalytics();

	// Site Overview does not show the Status column, so we use this column for error messages.
	if (
		inOverview &&
		domain.subtype.id === DomainSubtype.DOMAIN_CONNECTION &&
		domain.domain_status.id === DomainStatus.CONNECTION_ERROR
	) {
		return <Text intent={ domain.domain_status.type }>{ domain.domain_status.label }</Text>;
	}

	if ( domain.expiry === null ) {
		if ( domain.subtype.id === DomainSubtype.DEFAULT_ADDRESS ) {
			return __( 'Free forever' );
		}
		return '-';
	}

	const renewLabel = domain.auto_renewing
		? __( 'Auto-renew is on' )
		: canEnableAutoRenew( domain ) && (
				<Link
					to={ purchaseSettingsRoute.fullPath }
					params={ { purchaseId: domain.subscription_id } }
					onClick={ () =>
						recordTracksEvent( 'calypso_dashboard_domains_turn_on_auto_renew_click', {
							domain: domain.domain,
						} )
					}
				>
					{ __( 'Turn on auto-renew' ) }
				</Link>
		  );

	return (
		<VStack justify="flex-start" alignment="left" spacing={ 1 }>
			<Text intent={ domain.expired ? 'error' : undefined }>{ value }</Text>
			{ renewLabel && <Text variant="muted">{ renewLabel }</Text> }
		</VStack>
	);
};
