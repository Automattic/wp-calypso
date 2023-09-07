import { PartialDomainData } from '@automattic/data-stores';
import { useLocale } from '@automattic/i18n-utils';

interface DomainsTableRegisteredUntilCellProps {
	domain: PartialDomainData;
}

export const DomainsTableRegisteredUntilCell = ( {
	domain,
}: DomainsTableRegisteredUntilCellProps ) => {
	const localeSlug = useLocale();

	return domain.has_registration
		? new Intl.DateTimeFormat( localeSlug, { dateStyle: 'medium' } ).format(
				new Date( domain.expiry )
		  )
		: '-';
};
