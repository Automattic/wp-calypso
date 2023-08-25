import { DomainData } from '@automattic/data-stores';
import { useTranslate } from 'i18n-calypso';
import { createSiteDomainObject } from '../utils/assembler';
import { resolveDomainStatus } from '../utils/resolve-domain-status';

interface DomainsTableStatusCellProps {
	currentDomainData?: DomainData;
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
	const responseDomain = createSiteDomainObject( currentDomainData );
	const { status, statusClass } = resolveDomainStatus( responseDomain, null, translate, dispatch, {
		siteSlug: siteSlug,
		getMappingErrors: true,
		currentRoute,
	} );

	return (
		<div className="domain-row__status-cell">
			<span className={ `domain-row__${ statusClass }-dot` }></span> { status }
		</div>
	);
};
