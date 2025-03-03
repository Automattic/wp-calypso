import { JobStatus } from '@automattic/data-stores';
import { StatusPopover } from '@automattic/domains-table/src/status-popover';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import wpcomRequest from 'wpcom-proxy-request';
import { successNotice, errorNotice } from 'calypso/state/notices/actions';
import { useDomainsDataViewsContext } from './use-context';

const getSuccessMessage = ( job: JobStatus, translate: ( original: string ) => string ) => {
	if ( job.action !== 'set_auto_renew' ) {
		return job.success.length > 1
			? translate( 'Your domains have been updated.' )
			: translate( 'Your domain has been updated.' );
	}

	// If the user tried to enable auto-renew:
	if ( job.params.auto_renew ) {
		return job.success.length > 1
			? translate( 'Automatic renewal has been enabled for your domains.' )
			: translate( 'Automatic renewal has been enabled for your domain.' );
	}

	// If the user tired to disable auto-renew:
	return job.success.length > 1
		? translate( 'Automatic renewal has been disabled for your domains.' )
		: translate( 'Automatic renewal has been disabled for your domain.' );
};

const getFailureMessage = ( job: JobStatus, translate: ( original: string ) => string ) => {
	if ( job.action !== 'set_auto_renew' ) {
		return job.failed.length > 1
			? translate( 'Some domain updates were not successful.' )
			: translate( 'Your domain update has failed.' );
	}

	if ( job.params.auto_renew ) {
		return job.failed.length > 1
			? translate( 'Enabling automatic renewal has failed for your domains.' )
			: translate( 'Enabling automatic renewal has failed for your domain.' );
	}

	return job.failed.length > 1
		? translate( 'Disabling automatic renewal has failed for your domains.' )
		: translate( 'Disabling automatic renewal has failed for your domain.' );
};

export default function useBulkActionNotice() {
	const translate = useTranslate();
	const dispatch = useDispatch();

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
				dispatch(
					errorNotice(
						<div style={ { display: 'flex', alignItems: 'center', gap: '8px' } }>
							{ getFailureMessage( job, translate ) }
							<StatusPopover
								position="bottom"
								popoverTargetElement={
									<div style={ { color: 'var(--color-text-inverted)', fontSize: '0.875rem' } }>
										{ translate( 'Details' ) }{ ' ' }
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
					)
				);

				return;
			}

			dispatch( successNotice( getSuccessMessage( job, translate ) ) );
		} );

		if ( unshownJobIds.length > 0 ) {
			setShownNotices( ( prevShownNotices ) => [ ...prevShownNotices, ...unshownJobIds ] );
		}
	}, [ unprocessedJobs, unshownJobIds ] );
}
