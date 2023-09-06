import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import wpcomRequest from 'wpcom-proxy-request';
//eslint-disable-next-line no-restricted-imports
import Notice from 'calypso/components/notice';
//eslint-disable-next-line no-restricted-imports
import NoticeAction from 'calypso/components/notice/notice-action';
import { StatusPopover } from '../status-popover/index';
import { useDomainsTable } from './domains-table';

export const DomainsTableBulkUpdateNotice = () => {
	const translate = useTranslate();
	const { completedJobs, handleRestartDomainStatusPolling } = useDomainsTable();
	const [ dismissedJobs, setDismissedJobs ] = useState< string[] >( [] );

	const handleDismissNotice = async ( jobId: string ) => {
		setDismissedJobs( dismissedJobs.concat( [ jobId ] ) );
		await wpcomRequest< void >( {
			path: '/domains/bulk-actions',
			apiNamespace: 'wpcom/v2',
			apiVersion: '2',
			method: 'DELETE',
		} );
		handleRestartDomainStatusPolling();
	};

	// completed jobs can be announced
	return completedJobs
		.filter( ( job ) => ! dismissedJobs.includes( job.id ) )
		.map( ( job ) => {
			if ( job.failed.length ) {
				return (
					<Notice
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
				<Notice status="is-success" onDismissClick={ () => handleDismissNotice( job.id ) }>
					{ translate( 'Bulk domain updates finished successfully ' ) }
				</Notice>
			);
		} );
};
