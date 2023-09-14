import { Gridicon } from '@automattic/components';
import { PartialDomainData } from '@automattic/data-stores';
import { useLocale } from '@automattic/i18n-utils';
import { useI18n } from '@wordpress/react-i18n';
import moment from 'moment';

interface DomainsTableExpiresRewnewsOnCellProps {
	domain: PartialDomainData;
	isMobile?: boolean;
}

export const DomainsTableExpiresRewnewsOnCell = ( {
	domain,
}: DomainsTableExpiresRewnewsOnCellProps ) => {
	const localeSlug = useLocale();
	const isExpired = domain.expiry && moment( domain.expiry ).utc().isBefore( moment().utc() );
	const { __ } = useI18n();
	const notice = isExpired ? __( 'Expired' ) : __( 'Renews' );

	return (
		<div className="domains-table-row__renews-on-cell">
			{ domain.has_registration ? (
				<>
					<Gridicon icon={ isExpired ? 'notice-outline' : 'reblog' } size={ 18 } />
					{ `${ notice } ${ new Intl.DateTimeFormat( localeSlug, {
						dateStyle: 'medium',
					} ).format( new Date( domain.expiry ) ) }` }
				</>
			) : (
				'-'
			) }
		</div>
	);
};
