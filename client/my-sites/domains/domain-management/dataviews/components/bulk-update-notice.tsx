import { StatusPopover } from '@automattic/domains-table/src/status-popover';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import wpcomRequest from 'wpcom-proxy-request';
import Notice, { NoticeStatus } from 'calypso/components/notice'; //eslint-disable-line no-restricted-imports
import NoticeAction from 'calypso/components/notice/notice-action'; //eslint-disable-line no-restricted-imports
import { useDomainsDataViewsContext } from '../use-context';

const NoticeWithDetails = ( {
	status,
	message,
	domains,
	jobId,
	handleDismissNotice,
}: {
	status: NoticeStatus;
	message: string;
	domains: Array< string >;
	jobId: string;
	handleDismissNotice: ( jobId: string ) => void;
} ) => {
	const translate = useTranslate();

	return (
		<Notice
			key={ jobId }
			status={ status }
			text={ message }
			onDismissClick={ () => handleDismissNotice( jobId ) }
		>
			<StatusPopover
				position="bottom"
				popoverTargetElement={
					<NoticeAction href="#">{ translate( 'Domains list' ) } </NoticeAction>
				}
			>
				<div className="domains-table-bulk-actions-notice-popover">
					{ domains.map( ( domain ) => (
						<p key={ domain }> { domain } </p>
					) ) }
				</div>
			</StatusPopover>
		</Notice>
	);
};

export const BulkUpdateNotice = () => {
	const translate = useTranslate();
	const { completedJobs, handleRestartDomainStatusPolling, deleteBulkActionStatus } =
		useDomainsDataViewsContext();
	const [ dismissedJobs, setDismissedJobs ] = useState< string[] >( [] );

	const handleDismissNotice = async ( jobId: string ) => {
		setDismissedJobs( dismissedJobs.concat( [ jobId ] ) );
		if ( deleteBulkActionStatus ) {
			await deleteBulkActionStatus();
		} else {
			await wpcomRequest< void >( {
				path: '/domains/bulk-actions',
				apiNamespace: 'wpcom/v2',
				apiVersion: '2',
				method: 'DELETE',
			} );
		}
		handleRestartDomainStatusPolling();
	};

	// completed jobs can be announced
	return completedJobs
		.filter( ( job ) => ! dismissedJobs.includes( job.id ) )
		.map( ( job ) => {
			if ( job.failed.length ) {
				return (
					<NoticeWithDetails
						key={ job.id }
						status="is-error"
						message={ translate( 'Some domain updates were not successful.' ) }
						domains={ job.failed }
						jobId={ job.id }
						handleDismissNotice={ handleDismissNotice }
					/>
				);
			}

			const message =
				job.success.length > 1
					? translate( 'Bulk domain updates finished successfully.' )
					: translate( 'Domain update finished successfully.' );

			return (
				<NoticeWithDetails
					key={ job.id }
					status="is-success"
					message={ message }
					domains={ job.success }
					jobId={ job.id }
					handleDismissNotice={ handleDismissNotice }
				/>
			);
		} );
};
