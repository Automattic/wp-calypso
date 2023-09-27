import { Gridicon } from '@automattic/components';
import { PartialDomainData } from '@automattic/data-stores';
import { useLocale } from '@automattic/i18n-utils';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import moment from 'moment';

interface DomainsTableExpiresRewnewsOnCellProps {
	domain: PartialDomainData;
	isCompact?: boolean;
	as?: 'td' | 'div';
}

export const DomainsTableExpiresRewnewsOnCell = ( {
	domain,
	isCompact = false,
	as: Element = 'div',
}: DomainsTableExpiresRewnewsOnCellProps ) => {
	const localeSlug = useLocale();
	const isExpired = domain.expiry && moment( domain.expiry ).utc().isBefore( moment().utc() );
	const { __ } = useI18n();

	const isInvalidDate = isNaN( Date.parse( domain.expiry ) );
	const expiryDate =
		domain.has_registration && ! isInvalidDate
			? new Intl.DateTimeFormat( localeSlug, { dateStyle: 'medium' } ).format(
					new Date( domain.expiry )
			  )
			: null;
	const notice = isExpired
		? sprintf(
				/* translators: %s - The date on which the domain was expired */
				__( 'Expired %s' ),
				expiryDate
		  )
		: sprintf(
				/* translators: %s - The future date on which domain renews */
				__( 'Renews %s' ),
				expiryDate
		  );

	return (
		<Element className="domains-table-row__renews-on-cell">
			{ expiryDate ? (
				<>
					{ ! isCompact && (
						<Gridicon icon={ isExpired ? 'notice-outline' : 'reblog' } size={ 18 } />
					) }
					{ notice }
				</>
			) : (
				'-'
			) }
		</Element>
	);
};
