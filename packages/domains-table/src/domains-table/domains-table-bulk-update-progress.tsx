import { Gridicon, Popover } from '@automattic/components';
import { __ } from '@wordpress/i18n';
import classNames from 'classnames';
import React, { useRef, useState } from 'react';

interface DomainsTableBulkUpdateIndicatorProps {
	jobs: any[];
}

export const DomainsTableBulkUpdateIndicator = ( {
	jobs,
}: DomainsTableBulkUpdateIndicatorProps ) => {
	const buttonRef = useRef< HTMLButtonElement | undefined >();
	const [ showPopover, setShowPopover ] = useState( false );

	if ( jobs.length === 0 ) {
		return null;
	}

	const handleShowPopover = () => setShowPopover( true );
	const handleHidePopover = () => setShowPopover( false );

	const getActionName = ( action: string ) => {
		switch ( action ) {
			case 'set_auto_renew':
				return __( 'Change auto-renew mode' );
			case 'update_contact_details':
				return __( 'UpdØate contact details' );
			default:
				throw new Error( 'Unknown action: ' + action );
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
						<span> { __( 'Background tasks' ) }</span>
						{ jobs.map( ( job ) => (
							<div key={ job.created_at } className="domains-bulk-update-status-popover-item">
								<span
									className={ `domains-bulk-update-status-popover-item-indicator  domains-bulk-update-status-popover-item-indicator__${ getStatus(
										job
									) }` }
								/>
								<span>{ getActionName( job.action ) }</span>
							</div>
						) ) }
					</div>
				</Popover>
			) }
		</div>
	);
};
