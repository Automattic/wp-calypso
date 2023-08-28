import { useTranslate } from 'i18n-calypso';
import { DomainStatusPurchaseActions, resolveDomainStatus } from '../utils/resolve-domain-status';
import { ResponseDomain } from '../utils/types';

interface DomainsTableStatusCellProps {
	currentDomainData?: ResponseDomain;
	siteSlug?: string;
	domainStatusPurchaseActions?: DomainStatusPurchaseActions;
}

export const DomainsTableStatusCell = ( {
	currentDomainData,
	siteSlug,
	domainStatusPurchaseActions,
}: DomainsTableStatusCellProps ) => {
	const translate = useTranslate();
	if ( ! currentDomainData ) {
		return null;
	}
	const currentRoute = window.location.pathname;
	const { status, statusClass } = resolveDomainStatus( currentDomainData, {
		siteSlug: siteSlug,
		translate,
		getMappingErrors: true,
		currentRoute,
		isPurchasedDomain: domainStatusPurchaseActions?.isPurchasedDomain?.( currentDomainData ),
		isCreditCardExpiring: domainStatusPurchaseActions?.isCreditCardExpiring?.( currentDomainData ),
		onRenewNowClick: () =>
			domainStatusPurchaseActions?.onRenewNowClick?.( siteSlug ?? '', currentDomainData ),
	} );

	return (
		<div className="domain-row__status-cell">
			<span className={ `domain-row__${ statusClass }-dot` }></span> { status }
		</div>
	);
};
