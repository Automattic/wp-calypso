import { Gridicon, Popover } from '@automattic/components';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import React, { useRef, useState } from 'react';
import wpcomRequest from 'wpcom-proxy-request';

interface DomainsTableBulkUpdateIndicatorProps {
	jobs: any[];
}

export const DomainsTableBulkUpdateIndicator = ( {
	jobs,
}: DomainsTableBulkUpdateIndicatorProps ) => {
	const translate = useTranslate();
	const buttonRef = useRef< HTMLButtonElement >();
	const [ showPopover, setShowPopover ] = useState( false );

	if ( jobs.length === 0 ) {
		return null;
	}

	const handleShowPopover = () => setShowPopover( true );
	const handleHidePopover = () => {
		wpcomRequest< void >( {
			path: '/domains/bulk-actions',
			apiNamespace: 'wpcom/v2',
			apiVersion: '2',
			method: 'DELETE',
		} );
		setShowPopover( false );
	};

	const getDescription = ( job: any ) => {
		const { success, pending, failed } = job;
		const totalComplete = success.length + failed.length;
		const total = totalComplete + pending.length;
		const progress = `${ totalComplete }/${ total }`;
		const args = {
			progress,
		};

		switch ( job.action ) {
			case 'set_auto_renew':
				return translate( 'Change auto-renew mode %(progress)s', { args } );
			case 'update_contact_details':
				return translate( 'Update contact details %(progress)s', { args } );
			default:
				throw new Error( 'Unknown action: ' + job.action );
		}
	};

	const getStatus = ( job: any ) => {
		if ( job.complete ) {
			if ( job.failed.length ) {
				return 'failed';
			}
			return 'complete';
		}
		return 'pending';
	};

	return (
		<div className="domains-table-bulk-update-jobs-notifications">
			<button ref={ buttonRef } onClick={ handleShowPopover }>
				<Gridicon icon="bell" size={ 36 } />
				<span className="domains-table-bulk-update-jobs-notifications__bubble">
					{ jobs.length }
				</span>
			</button>
			{ showPopover && (
				<Popover
					autoRtl
					id="status-popover"
					isVisible
					context={ buttonRef.current }
					position="bottom"
					className={ classNames( 'status-popover__tooltip' ) }
					onClose={ handleHidePopover }
				>
					<div className="domains-bulk-update-status-popover">
						<span> { translate( 'Background tasks' ) }</span>
						{ jobs.map( ( job ) => (
							<div key={ job.created_at } className="domains-bulk-update-status-popover-item">
								<span
									className={ `domains-bulk-update-status-popover-item-indicator__${ getStatus(
										job
									) }` }
								/>
								<span>{ getDescription( job ) }</span>
							</div>
						) ) }
					</div>
				</Popover>
			) }
		</div>
	);
};
