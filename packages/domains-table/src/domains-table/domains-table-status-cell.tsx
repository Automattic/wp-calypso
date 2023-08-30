import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { StatusPopover } from '../status-popover';
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
	const { status, noticeText, statusClass } = resolveDomainStatus( currentDomainData, {
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
		<div
			className={ classNames(
				'domains-table-row__status-cell',
				`domains-table-row__status-cell__${ statusClass }`
			) }
		>
			{ status }
			{ noticeText && (
				<StatusPopover className={ `domains-table-row__status-cell__${ statusClass }` }>
					{ noticeText }
				</StatusPopover>
			) }
		</div>
	);
};
