import { JobStatus } from '@automattic/data-stores';
import { StatusPopover } from '@automattic/domains-table/src/status-popover';
import { TranslateOptionsPlural, useTranslate } from 'i18n-calypso';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import wpcomRequest from 'wpcom-proxy-request';
import { successNotice, errorNotice } from 'calypso/state/notices/actions';
import { useDomainsDataViewsContext } from './use-context';

type ExistingReactNode = React.ReactElement | string | number;
type TranslateFunction = (
	original: string,
	plural: string,
	options: TranslateOptionsPlural
) => ExistingReactNode;

const getSuccessMessage = ( job: JobStatus, translate: TranslateFunction ) => {
	if ( job.action !== 'set_auto_renew' ) {
		return translate( 'Your domain has been updated.', 'Your domains have been updated.', {
			count: job.success.length,
		} );
	}

	// If the user tried to enable auto-renew:
	if ( job.params.auto_renew ) {
		return translate(
			'Automatic renewal has been enabled for your domain.',
			'Automatic renewal has been enabled for your domains.',
			{ count: job.success.length }
		);
	}

	// If the user tried to disable auto-renew:
	return translate(
		'Automatic renewal has been disabled for your domain.',
		'Automatic renewal has been disabled for your domains.',
		{ count: job.success.length }
	);
};

const getFailureMessage = ( job: JobStatus, translate: TranslateFunction ) => {
	if ( job.action !== 'set_auto_renew' ) {
		return translate(
			'Your domain update has failed.',
			'Some domain updates were not successful.',
			{ count: job.failed.length }
		);
	}

	if ( job.params.auto_renew ) {
		return translate(
			'Enabling automatic renewal has failed for your domain.',
			'Enabling automatic renewal has failed for your domains.',
			{ count: job.failed.length }
		);
	}

	return translate(
		'Disabling automatic renewal has failed for your domain.',
		'Disabling automatic renewal has failed for your domains.',
		{ count: job.failed.length }
	);
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
						<div className="domains-dataviews-bulk-actions-notice">
							{ getFailureMessage( job, translate ) }
							<StatusPopover
								position="bottom"
								popoverTargetElement={
									<div className="domains-dataviews-bulk-actions-notice__label">
										{ translate( 'Details' ) }{ ' ' }
									</div>
								}
							>
								<div className="domains-dataviews-bulk-actions-notice__details">
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
