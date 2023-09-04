import { Gridicon, Popover } from '@automattic/components';
import { JobStatus } from '@automattic/data-stores';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import React, { useRef, useState } from 'react';
import wpcomRequest from 'wpcom-proxy-request';

interface DomainResultsProps {
	job: JobStatus;
}

const DomainResults = ( { job }: DomainResultsProps ) => {
	return (
		<div className="domains-bulk-update-status-popover-domain-results">
			{ job.failed.map( ( domain ) => (
				<div className="domains-bulk-update-status-popover-domain-results-group">
					<Gridicon icon="notice" size={ 16 } color="var(--studio-red-50)" />
					<span> { domain } </span>
				</div>
			) ) }

			{ job.pending.map( ( domain ) => (
				<div className="domains-bulk-update-status-popover-domain-results-group">
					<Gridicon icon="time" size={ 16 } color="var(--studio-orange-40)" />
					<span> { domain } </span>
				</div>
			) ) }

			{ job.success.map( ( domain ) => (
				<div className="domains-bulk-update-status-popover-domain-results-group">
					<Gridicon icon="checkmark" size={ 16 } color="var(--studio-green-40)" />
					<span> { domain } </span>
				</div>
			) ) }
		</div>
	);
};

interface JobResultsProps {
	job: JobStatus;
}

const JobResults = ( { job }: JobResultsProps ) => {
	const translate = useTranslate();
	const [ expanded, setExpanded ] = useState( false );

	const getDescription = ( job: JobStatus ) => {
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

	const getStatus = ( job: JobStatus ) => {
		if ( job.complete ) {
			if ( job.failed.length ) {
				return 'failed';
			}
			return 'complete';
		}
		return 'pending';
	};

	return (
		<>
			<div key={ job.created_at } className="domains-bulk-update-status-popover-item">
				<span
					className={ `domains-bulk-update-status-popover-item-indicator__${ getStatus( job ) }` }
				/>
				<span>{ getDescription( job ) }</span>
				<button onClick={ () => setExpanded( ! expanded ) }>
					{ expanded ? (
						<Gridicon icon="chevron-up" size={ 16 } />
					) : (
						<Gridicon icon="chevron-down" size={ 16 } />
					) }
				</button>
			</div>
			{ expanded && <DomainResults job={ job } /> }
		</>
	);
};

interface DomainsTableBulkUpdateIndicatorProps {
	jobs: JobStatus[];
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

	return (
		<div className="domains-table-bulk-update-jobs-notifications">
			<button ref={ buttonRef } onClick={ handleShowPopover }>
				<Gridicon icon="bell" size={ 36 } />
				<span className="domains-table-bulk-update-jobs-notifications-bubble">{ jobs.length }</span>
			</button>
			{ showPopover && (
				<Popover
					autoRtl
					id="status-popover"
					isVisible
					context={ buttonRef.current }
					position="bottom"
					className={ classNames( 'domains-table-bulk-update-jobs-notifications-tooltip' ) }
					onClose={ handleHidePopover }
				>
					<div className="domains-bulk-update-status-popover">
						<span> { translate( 'Bulk updates' ) }</span>
						{ jobs.map( ( job, index ) => (
							<div key={ index }>
								<JobResults job={ job } />
								{ index + 1 < jobs.length && (
									<div className="domains-bulk-update-status-popover-divider" />
								) }
							</div>
						) ) }
					</div>
				</Popover>
			) }
		</div>
	);
};
