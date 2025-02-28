import { StatusPopover } from '@automattic/domains-table/src/status-popover';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useEffect, useMemo, useState } from 'react';
import wpcomRequest from 'wpcom-proxy-request';
import { NoticeActionCreator } from 'calypso/state/notices/types';
import { useDomainsDataViewsContext } from './use-context';

export default function useBulkActionNotice(
	successNotice: NoticeActionCreator,
	errorNotice: NoticeActionCreator
) {
	const translate = useTranslate();
	const { completedJobs, handleRestartDomainStatusPolling, deleteBulkActionStatus } =
		useDomainsDataViewsContext();
	const [ shownNotices, setShownNotices ] = useState< string[] >( [] );

	const unprocessedJobs = useMemo(
		() => completedJobs.filter( ( job ) => ! shownNotices.includes( job.id ) ),
		[ completedJobs, shownNotices ]
	);
	const unshownJobIds = useMemo( () => unprocessedJobs.map( ( j ) => j.id ), [ unprocessedJobs ] );

	const deleteBulkActionStatusOnDismiss = useCallback( async () => {
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
	}, [ deleteBulkActionStatus, handleRestartDomainStatusPolling ] );

	useEffect( () => {
		unprocessedJobs.map( ( job ) => {
			if ( job.failed.length ) {
				errorNotice(
					<div style={ { display: 'flex', alignItems: 'center', gap: '8px' } }>
						{ translate( 'Some domain updates were not successful.' ) }
						<StatusPopover
							position="bottom"
							popoverTargetElement={
								<div style={ { color: 'var(--color-text-inverted)', fontSize: '0.875rem' } }>
									{ translate( 'Domains list' ) }{ ' ' }
								</div>
							}
						>
							<div className="domains-table-bulk-actions-notice-popover">
								{ job.failed.map( ( domain ) => (
									<p key={ domain }> { domain } </p>
								) ) }
							</div>
						</StatusPopover>
					</div>,
					{
						onDismissClick: deleteBulkActionStatusOnDismiss,
					}
				);

				return;
			}

			const message =
				job.success.length > 1
					? translate( 'Bulk domain updates finished successfully.' )
					: translate( 'Domain update finished successfully.' );

			successNotice( message );
		} );

		if ( unshownJobIds.length > 0 ) {
			setShownNotices( ( prevShownNotices ) => [ ...prevShownNotices, ...unshownJobIds ] );
		}
	}, [ unprocessedJobs, unshownJobIds ] );
}
