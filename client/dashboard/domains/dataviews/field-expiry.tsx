import { DomainSubtype, DomainStatus } from '@automattic/api-core';
import { Link } from '@tanstack/react-router';
import { __experimentalVStack as VStack } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { Text } from '../../components/text';
import { getPurchaseUrlForId } from '../../me/billing-purchases/urls';
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

	return (
		<VStack justify="flex-start" alignment="left" spacing={ 1 }>
			<Text intent={ domain.expired ? 'error' : undefined }>{ value }</Text>
			<Text variant="muted">
				{ domain.auto_renewing ? (
					__( 'Auto-renew is on' )
				) : (
					<Link to={ getPurchaseUrlForId( domain.subscription_id ?? 0 ) }>
						{ __( 'Turn on auto-renew' ) }
					</Link>
				) }
			</Text>
		</VStack>
	);
};
