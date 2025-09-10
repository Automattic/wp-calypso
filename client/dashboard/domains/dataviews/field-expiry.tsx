import { Icon, __experimentalHStack as HStack } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { caution, reusableBlock } from '@wordpress/icons';
import type { DomainSummary } from '@automattic/api-core';

export const DomainExpiryField = ( {
	domain,
	value,
	isCompact = false,
}: {
	domain: DomainSummary;
	value: string;
	isCompact?: boolean;
} ) => {
	if ( ! domain.expiry ) {
		return __( 'Free forever' );
	}

	const isAutoRenewing = Boolean( domain.auto_renewing );
	const isExpired = new Date( domain.expiry ) < new Date();
	const isHundredYearDomain = Boolean( domain.is_hundred_year_domain );
	const renderExpiry = () => {
		if ( isHundredYearDomain ) {
			return sprintf(
				/* translators: %s - The date until which a domain was paid for */
				__( 'Paid until %s' ),
				value
			);
		}

		if ( isExpired ) {
			return sprintf(
				/* translators: %s - The date on which a domain has expired */
				__( 'Expired on %s' ),
				value
			);
		}

		if ( ! isAutoRenewing ) {
			return sprintf(
				/* translators: %s - The date on which a domain expires */
				__( 'Expires on %s' ),
				value
			);
		}

		return sprintf(
			/* translators: %s - The future date on which a domain renews */
			__( 'Renews on %s' ),
			value
		);
	};

	return (
		<HStack justify="flex-start" alignment="center" spacing={ 1 }>
			{ ! isCompact && (
				<Icon
					icon={ isExpired || isHundredYearDomain ? caution : reusableBlock }
					size={ 16 }
					style={ { fill: 'currentColor' } }
				/>
			) }
			<span>{ renderExpiry() }</span>
		</HStack>
	);
};
