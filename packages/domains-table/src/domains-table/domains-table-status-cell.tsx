import { Spinner } from '@automattic/components';
import { DomainUpdateStatus } from '@automattic/data-stores';
import { useLocale } from '@automattic/i18n-utils';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { StatusPopover } from '../status-popover';
import { ResolveDomainStatusReturn } from '../utils/resolve-domain-status';

interface DomainsTableStatusCellProps {
	domainStatus: ResolveDomainStatusReturn | null;
	pendingUpdates: DomainUpdateStatus[];
	as?: 'td' | 'div';
}

export const DomainsTableStatusCell = ( {
	domainStatus,
	pendingUpdates,
	as: Element = 'div',
}: DomainsTableStatusCellProps ) => {
	const translate = useTranslate();
	const locale = useLocale();

	const getActionName = ( status: DomainUpdateStatus ) => {
		if ( 'message' in status ) {
			return status.message;
		}

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
		<Element
			className={ classNames( 'domains-table-row__status-cell', {
				[ `domains-table-row__status-cell__${ domainStatus?.statusClass }` ]:
					!! domainStatus?.statusClass,
			} ) }
		>
			{ domainStatus?.status ?? translate( 'Unknown status' ) }
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
								{ update.created_at && (
									<span className="domains-bulk-update-status-popover-item-date">
										{ ' ' }
										{ getTime( update.created_at ) }
									</span>
								) }
							</div>
						) ) }
					</div>
				</StatusPopover>
			) }
			{ domainStatus?.noticeText && (
				<StatusPopover
					className={ `domains-table-row__status-cell__${ domainStatus.statusClass }` }
				>
					{ domainStatus.noticeText }
				</StatusPopover>
			) }
		</Element>
	);
};
