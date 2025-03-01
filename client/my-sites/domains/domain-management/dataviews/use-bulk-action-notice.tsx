import { JobStatus } from '@automattic/data-stores';
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
			'We were unable to enable automatic renewal for your domain. Please try again.',
			'We were unable to enable automatic renewal for your domains. Please try again.',
			{ count: job.failed.length }
		);
	}

	return translate(
		'We were unable to disable automatic renewal for your domain. Please try again.',
		'We were unable to disable automatic renewal for your domains. Please try again.',
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
					errorNotice( getFailureMessage( job, translate ), {
						onDismissClick: deleteBulkActionStatusOnDismiss,
					} )
				);

				return;
			}

			dispatch(
				successNotice( getSuccessMessage( job, translate ), {
					onDismissClick: deleteBulkActionStatusOnDismiss,
				} )
			);
		} );

		if ( unshownJobIds.length > 0 ) {
			setShownNotices( ( prevShownNotices ) => [ ...prevShownNotices, ...unshownJobIds ] );
		}
	}, [ unprocessedJobs, unshownJobIds ] );
}
