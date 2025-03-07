import { JobStatus } from '@automattic/data-stores';
import { useHasEnTranslation } from '@automattic/i18n-utils';
import { translate, useTranslate } from 'i18n-calypso';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import wpcomRequest from 'wpcom-proxy-request';
import { successNotice, errorNotice } from 'calypso/state/notices/actions';
import { useDomainsDataViewsContext } from './use-context';

type TranslateFunction = typeof translate;
type HasTranslation = ( single: string, context?: string, domain?: string ) => boolean;

const fallbackSuccessMessage = ( translate: TranslateFunction ) => {
	return translate( 'Bulk domain updates finished successfully.' );
};

const getSuccessMessage = (
	job: JobStatus,
	translate: TranslateFunction,
	hasEnTranslation: HasTranslation
) => {
	if ( job.action !== 'set_auto_renew' ) {
		if ( hasEnTranslation( 'Your domain has been updated.' ) ) {
			return translate( 'Your domain has been updated.', 'Your domains have been updated.', {
				count: job.success.length,
			} );
		}

		return fallbackSuccessMessage( translate );
	}

	// If the user tried to enable auto-renew:
	if ( job.params.auto_renew ) {
		if ( hasEnTranslation( 'Automatic renewal has been enabled for your domain.' ) ) {
			return translate(
				'Automatic renewal has been enabled for your domain.',
				'Automatic renewal has been enabled for your domains.',
				{ count: job.success.length }
			);
		}

		return fallbackSuccessMessage( translate );
	}

	// If the user tried to disable auto-renew:
	if ( hasEnTranslation( 'Automatic renewal has been disabled for your domain.' ) ) {
		return translate(
			'Automatic renewal has been disabled for your domain.',
			'Automatic renewal has been disabled for your domains.',
			{ count: job.success.length }
		);
	}

	return fallbackSuccessMessage( translate );
};

const fallbackFailureMessage = ( translate: TranslateFunction ) => {
	return translate( 'Some domain updates were not successful.' );
};

const getFailureMessage = (
	job: JobStatus,
	translate: TranslateFunction,
	hasEnTranslation: HasTranslation
) => {
	if ( job.action !== 'set_auto_renew' ) {
		if ( hasEnTranslation( 'Your domain update has failed.' ) ) {
			return translate(
				'Your domain update has failed.',
				'Some domain updates were not successful.',
				{ count: job.failed.length }
			);
		}

		return fallbackFailureMessage( translate );
	}

	if ( job.params.auto_renew ) {
		if (
			hasEnTranslation(
				'We were unable to enable automatic renewal for your domain. Please try again.'
			)
		) {
			return translate(
				'We were unable to enable automatic renewal for your domain. Please try again.',
				'We were unable to enable automatic renewal for your domains. Please try again.',
				{ count: job.failed.length }
			);
		}

		return fallbackFailureMessage( translate );
	}

	if (
		hasEnTranslation(
			'We were unable to disable automatic renewal for your domain. Please try again.'
		)
	) {
		return translate(
			'We were unable to disable automatic renewal for your domain. Please try again.',
			'We were unable to disable automatic renewal for your domains. Please try again.',
			{ count: job.failed.length }
		);
	}

	return fallbackFailureMessage( translate );
};

export default function useBulkActionNotice() {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const hasEnTranslation = useHasEnTranslation();

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
				method: 'DELETE',
			} );
		}
		handleRestartDomainStatusPolling();
	}, [ deleteBulkActionStatus, handleRestartDomainStatusPolling ] );

	useEffect( () => {
		unprocessedJobs.map( ( job ) => {
			if ( job.failed.length ) {
				dispatch(
					errorNotice( getFailureMessage( job, translate, hasEnTranslation ), {
						onDismissClick: deleteBulkActionStatusOnDismiss,
					} )
				);

				return;
			}

			dispatch(
				successNotice( getSuccessMessage( job, translate, hasEnTranslation ), {
					onDismissClick: deleteBulkActionStatusOnDismiss,
				} )
			);
		} );

		if ( unshownJobIds.length > 0 ) {
			setShownNotices( ( prevShownNotices ) => [ ...prevShownNotices, ...unshownJobIds ] );
		}
	}, [ unprocessedJobs, unshownJobIds ] );
}
