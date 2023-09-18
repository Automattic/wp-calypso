import { Spinner } from '@automattic/components';
import { DomainUpdateStatus } from '@automattic/data-stores';
import { useLocale } from '@automattic/i18n-utils';
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
	const locale = useLocale();
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

	const getActionName = ( status: DomainUpdateStatus ) => {
		switch ( status.action ) {
			case 'set_auto_renew':
				return translate( 'Change auto-renew mode' );
			case 'update_contact_info':
				return translate( 'Update contact details' );
			default:
				throw new Error( 'Unknown action: ' + status.action );
		}
	};

	const getTime = ( unixTimestamp: number ) => {
		return Intl.DateTimeFormat( locale, { dateStyle: 'medium', timeStyle: 'medium' } ).format(
			new Date( unixTimestamp * 1000 )
		);
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
				<StatusPopover popoverTargetElement={ <Spinner size={ 16 } /> }>
					<div className="domains-bulk-update-status-popover">
						<span> { translate( 'Pending updates' ) }</span>
						{ pendingUpdates.map( ( update, index ) => (
							<div key={ index } className="domains-bulk-update-status-popover-item">
								<div>
									<span className="domains-bulk-update-status-popover-item-indicator__pending" />
									<span>{ getActionName( update ) }</span>
								</div>
								<span className="domains-bulk-update-status-popover-item-date">
									{ ' ' }
									{ getTime( update.created_at ) }
								</span>
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
