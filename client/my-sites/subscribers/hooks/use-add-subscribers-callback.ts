import { useActiveJobRecognition, useImportError } from '@automattic/subscriber';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslate } from 'i18n-calypso';
import { useDispatch } from 'react-redux';
import { useSelector } from 'calypso/state';
import { successNotice, errorNotice } from 'calypso/state/notices/actions';
import { getSiteSlug, isJetpackSite } from 'calypso/state/sites/selectors';

/**
 * This callback is used to fire off a notice when the subscribers are added.
 * @param siteId - The site ID of the current site.
 * @returns A callback function that adds subscribers to a site.
 */
export const useAddSubscribersCallback = ( siteId: number | null ) => {
	const { completedJob } = useActiveJobRecognition( siteId ?? 0 );
	const importError = useImportError();
	const isJetpackNonAtomic = useSelector( ( state ) =>
		isJetpackSite( state, siteId, { treatAtomicAsJetpackSite: false } )
	);
	const siteSlug = useSelector( ( state ) => getSiteSlug( state, siteId ) );

	const dispatch = useDispatch();
	const translate = useTranslate();
	const queryClient = useQueryClient();

	const addSubscribersCallback = () => {
		if ( ! importError ) {
			if ( completedJob ) {
				const {
					email_count,
					subscribed_count,
					already_subscribed_count,
					failed_subscribed_count,
					status,
				} = completedJob;
				if ( status === 'cancelled' ) {
					// Handle when the import is cancelled.
					dispatch(
						successNotice(
							translate( 'Import has been successfully cancelled. Please try again.' )
						)
					);
				} else {
					dispatch(
						successNotice(
							translate(
								'Import completed. %(added)d subscribed, %(skipped)d already subscribed, and %(failed)d failed out of %(total)d %(totalLabel)s.',
								{
									args: {
										added: subscribed_count,
										skipped: already_subscribed_count,
										failed: failed_subscribed_count,
										total: email_count,
										totalLabel: translate( 'subscriber', 'subscribers', {
											count: email_count,
										} ),
									},
								}
							)
						)
					);

					// Invalidate the subscribers queries to ensure that the new subscribers are fetched.
					queryClient.invalidateQueries( { queryKey: [ 'subscribers', siteId ] } );
					queryClient.invalidateQueries( { queryKey: [ 'subscribers', 'count', siteId ] } );
				}
			} else {
				dispatch(
					successNotice(
						translate(
							"Your subscriber list is being processed. We'll send you an email when it's finished importing."
						),
						{
							duration: 5000,
						}
					)
				);
			}
		} else {
			let notice = translate( 'An unknown error has occurred. Please try again in a second.' );
			interface NoticeArgs {
				isPersistent: boolean;
				button?: string;
				href?: string;
			}
			const noticeArgs: NoticeArgs = { isPersistent: true };

			if (
				'error' in importError &&
				typeof importError.error === 'object' &&
				importError.error &&
				'code' in importError.error &&
				'message' in importError.error
			) {
				const { code, message } = importError.error;
				notice = message as string;
				if ( code === 'subscriber_import_limit_reached' && typeof message === 'string' ) {
					noticeArgs.button = translate( 'Upgrade' );
					noticeArgs.href = isJetpackNonAtomic
						? `https://cloud.jetpack.com/pricing/${ siteSlug }`
						: `https://wordpress.com/plans/${ siteSlug }`;
				}
			}

			dispatch( errorNotice( notice, noticeArgs ) );
		}
	};

	return addSubscribersCallback;
};
