import { DomainSubtype, DomainStatus } from '@automattic/api-core';
import { userPurchasesQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { __experimentalVStack as VStack } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { useAnalytics } from '../../app/analytics';
import { purchaseSettingsRoute } from '../../app/router/me';
import { Text } from '../../components/text';
import { canEnableAutoRenew, needsPaymentMethodToAutoRenew } from '../../utils/domain';
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
	const { data: purchases } = useQuery( userPurchasesQuery() );
	const purchase = purchases?.find(
		( p ) => p.ID === parseInt( domain.subscription_id ?? '0', 10 )
	);

	// Site Overview does not show the Status column, so we use this column for error messages.
	if (
		inOverview &&
		domain.subtype.id === DomainSubtype.DOMAIN_CONNECTION &&
		domain.domain_status.id === DomainStatus.CONNECTION_ERROR
	) {
		return <Text intent={ domain.domain_status.type }>{ domain.domain_status.label }</Text>;
	}

	if ( domain.expiry === null ) {
		// Wrapping span are a work around to an issue where Google Translate crashes the page.
		// A known React issue: react/react#11538
		if ( domain.subtype.id === DomainSubtype.DEFAULT_ADDRESS ) {
			return <span>{ __( 'Free forever' ) }</span>;
		}
		return <span>-</span>;
	}

	const autoRenewOnLabel = needsPaymentMethodToAutoRenew( domain, purchase )
		? __( 'Needs payment method' )
		: __( 'Auto-renew is on' );

	const renewLabel = domain.auto_renewing
		? autoRenewOnLabel
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
			<Text intent={ domain.expired ? 'error' : undefined }>
				{ domain.expired
					? sprintf(
							/* translators: %s is the date the domain expired, e.g. September 4, 2026. */
							__( 'Expired on %s' ),
							value
						)
					: value }
			</Text>
			{ ! domain.expired && renewLabel && <Text variant="muted">{ renewLabel }</Text> }
		</VStack>
	);
};
