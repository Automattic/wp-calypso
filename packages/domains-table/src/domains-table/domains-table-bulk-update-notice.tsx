import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import wpcomRequest from 'wpcom-proxy-request';
import Notice from 'calypso/components/notice'; //eslint-disable-line no-restricted-imports
import NoticeAction from 'calypso/components/notice/notice-action'; //eslint-disable-line no-restricted-imports
import { StatusPopover } from '../status-popover/index';
import { useDomainsTable } from './domains-table';

export const DomainsTableBulkUpdateNotice = () => {
	const translate = useTranslate();
	const { completedJobs, handleRestartDomainStatusPolling, deleteBulkActionStatus } =
		useDomainsTable();
	const [ dismissedJobs, setDismissedJobs ] = useState< string[] >( [] );

	const handleDismissNotice = async ( jobId: string ) => {
		setDismissedJobs( dismissedJobs.concat( [ jobId ] ) );
		if ( deleteBulkActionStatus ) {
			await deleteBulkActionStatus();
		} else {
			await wpcomRequest< void >( {
				path: '/domains/bulk-actions',
				apiNamespace: 'wpcom/v2',
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
					<Notice
						key={ job.id }
						status="is-error"
						text={ translate( 'Some domain updates were not successful ' ) }
						onDismissClick={ () => handleDismissNotice( job.id ) }
					>
						<StatusPopover
							position="bottom"
							popoverTargetElement={
								<NoticeAction href="#">{ translate( 'See failures' ) } </NoticeAction>
							}
						>
							<div className="domains-table-bulk-actions-notice-popover">
								{ job.failed.map( ( domain ) => (
									<p key={ domain }> { domain } </p>
								) ) }
							</div>
						</StatusPopover>
					</Notice>
				);
			}

			return (
				<Notice
					key={ job.id }
					status="is-success"
					onDismissClick={ () => handleDismissNotice( job.id ) }
				>
					{ translate( 'Bulk domain updates finished successfully ' ) }
				</Notice>
			);
		} );
};
