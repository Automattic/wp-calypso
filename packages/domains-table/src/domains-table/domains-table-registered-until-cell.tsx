import { PartialDomainData } from '@automattic/data-stores';
import { useLocale } from '@automattic/i18n-utils';
import { formatDate } from '../utils/dates';

interface DomainsTableRegisteredUntilCellProps {
	domain: PartialDomainData;
}

export const DomainsTableRegisteredUntilCell = ( {
	domain,
}: DomainsTableRegisteredUntilCellProps ) => {
	const localeSlug = useLocale();

	return domain.has_registration ? formatDate( localeSlug, domain.expiry ) : '-';
};
