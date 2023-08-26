import { ResponseDomain } from '@automattic/data-stores/src/domains/types';
import { useTranslate } from 'i18n-calypso';
import { resolveDomainStatus } from '../utils/resolve-domain-status';

interface DomainsTableStatusCellProps {
	currentDomainData?: ResponseDomain;
	siteSlug?: string;
	dispatch: any;
}

export const DomainsTableStatusCell = ( {
	currentDomainData,
	siteSlug,
	dispatch,
}: DomainsTableStatusCellProps ) => {
	const translate = useTranslate();
	if ( ! currentDomainData ) {
		return null;
	}
	const currentRoute = window.location.pathname;
	const { status, statusClass } = resolveDomainStatus(
		currentDomainData,
		null,
		translate,
		dispatch,
		{
			siteSlug: siteSlug,
			getMappingErrors: true,
			currentRoute,
		}
	);

	return (
		<div className="domain-row__status-cell">
			<span className={ `domain-row__${ statusClass }-dot` }></span> { status }
		</div>
	);
};
