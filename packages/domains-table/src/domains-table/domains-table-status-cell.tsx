import { Spinner } from '@automattic/components';
import { DomainUpdateStatus } from '@automattic/data-stores';
import { __ } from '@wordpress/i18n';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { StatusPopover } from '../status-popover';
import { DomainStatusPurchaseActions, resolveDomainStatus } from '../utils/resolve-domain-status';
import { ResponseDomain } from '../utils/types';

interface DomainsTableStatusCellProps {
	currentDomainData?: ResponseDomain;
	siteSlug?: string;
	domainStatusPurchaseActions?: DomainStatusPurchaseActions;
	pendingUpdates: DomainUpdateStatus[];
}

export const DomainsTableStatusCell = ( {
	currentDomainData,
	siteSlug,
	domainStatusPurchaseActions,
	pendingUpdates,
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

	const getActionName = ( action: string ) => {
		switch ( action ) {
			case 'set_auto_renew':
				return __( 'Change auto-renew mode' );
			case 'update_contact_details':
				return __( 'Update contact details' );
			default:
				throw new Error( 'Unknown action: ' + action );
		}
	};

	return (
		<div
			className={ classNames(
				'domains-table-row__status-cell',
				`domains-table-row__status-cell__${ statusClass }`
			) }
		>
			{ status }
			{ pendingUpdates.length > 0 && (
				<StatusPopover target={ <Spinner size={ 16 } /> }>
					<div className="domains-bulk-update-status-popover">
						<span> { __( 'Pending updates' ) }</span>
						{ pendingUpdates.map( ( update ) => (
							<div key={ update.created_at } className="domains-bulk-update-status-popover-item">
								<span className="domains-bulk-update-status-popover-item-indicator domains-bulk-update-status-popover-item-indicator__pending" />
								<span>{ getActionName( update.action ) }</span>
							</div>
						) ) }
					</div>
				</StatusPopover>
			) }
			{ noticeText && (
				<StatusPopover className={ `domains-table-row__status-cell__${ statusClass }` }>
					{ noticeText }
				</StatusPopover>
			) }
		</div>
	);
};
