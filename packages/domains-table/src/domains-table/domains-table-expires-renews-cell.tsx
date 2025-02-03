import { Gridicon } from '@automattic/components';
import { PartialDomainData } from '@automattic/data-stores';
import { useLocale } from '@automattic/i18n-utils';
import { __, sprintf } from '@wordpress/i18n';
import moment from 'moment';

interface DomainsTableExpiresRenewsOnCellProps {
	domain: PartialDomainData;
	isCompact?: boolean;
	as?: 'td' | 'div';
}

function getNotice( {
	expiryDate,
	isAutoRenewing,
	isExpired,
	isHundredYearDomain,
}: {
	isAutoRenewing: boolean;
	isExpired: boolean;
	expiryDate: string;
	isHundredYearDomain: boolean;
} ): string {
	if ( isHundredYearDomain ) {
		return sprintf(
			/* translators: %s - The date until which a domain was paid for */
			__( 'Paid until %s' ),
			expiryDate
		);
	}

	if ( isExpired ) {
		return sprintf(
			/* translators: %s - The date on which a domain has expired */
			__( 'Expired %s' ),
			expiryDate
		);
	}

	if ( ! isAutoRenewing ) {
		return sprintf(
			/* translators: %s - The date on which a domain expires */
			__( 'Expires %s' ),
			expiryDate
		);
	}

	return sprintf(
		/* translators: %s - The future date on which a domain renews */
		__( 'Renews %s' ),
		expiryDate
	);
}

export const DomainsTableExpiresRenewsOnCell = ( {
	domain,
	isCompact = false,
	as: Element = 'div',
}: DomainsTableExpiresRenewsOnCellProps ) => {
	const localeSlug = useLocale();

	const isInvalidDate = isNaN( Date.parse( domain.expiry ) );

	const expiryDate =
		domain.has_registration && ! isInvalidDate
			? new Intl.DateTimeFormat( localeSlug, { dateStyle: 'medium' } ).format(
					new Date( domain.expiry )
			  )
			: null;

	const isAutoRenewing = Boolean( domain.auto_renewing );

	const isExpired = Boolean(
		domain.expiry && moment( domain.expiry ).utc().isBefore( moment().utc() )
	);

	const isHundredYearDomain = Boolean( domain.is_hundred_year_domain );

	return (
		<Element data-testid="expires-renews-on" className="domains-table-row__renews-on-cell">
			{ expiryDate ? (
				<>
					{ ! isCompact && (
						<Gridicon
							icon={ isExpired || isHundredYearDomain ? 'notice-outline' : 'reblog' }
							size={ 18 }
						/>
					) }

					{ getNotice( { expiryDate, isAutoRenewing, isExpired, isHundredYearDomain } ) }
				</>
			) : (
				'-'
			) }
		</Element>
	);
};
