import { useTranslate } from 'i18n-calypso';
import { useDispatch } from 'react-redux';
import wpcom from 'calypso/lib/wp';
import { successNotice, errorNotice } from 'calypso/state/notices/actions';
import { useCompleteImportSubscribersTask } from './use-complete-import-subscribers-task';

type Response = {
	success: boolean;
	message: string;
};

type ResponseWithBody = {
	body: Response;
};

/**
 * This callback is used to initiate the migrate subscribers process.
 * @param siteId - The site ID of the current site.
 * @returns A callback function that migrates subscribers from one site to another.
 */
export const useMigrateSubscribersCallback = ( siteId: number | null ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const completeImportSubscribersTask = useCompleteImportSubscribersTask();

	const migrateSubscribersCallback: ( sourceSiteId: number ) => Promise< void > = async (
		sourceSiteId
	) => {
		completeImportSubscribersTask();

		if ( ! siteId ) {
			return;
		}

		try {
			const response = await wpcom.req
				.post(
					`/jetpack-blogs/${ encodeURIComponent( siteId ) }/source/${ encodeURIComponent(
						sourceSiteId
					) }/migrate?http_envelope=1`
				)
				.then( ( data: ResponseWithBody & Response ) => {
					// In Calypso green the response has body
					return data.body ?? data;
				} );

			if ( response.success ) {
				dispatch(
					successNotice(
						translate(
							'Your subscriber migration has been queued. You will receive an email to indicate when it starts and finishes.'
						),
						{
							duration: 8000,
						}
					)
				);
			} else {
				dispatch(
					errorNotice( response.message, {
						duration: 5000,
					} )
				);
			}
		} catch {
			dispatch(
				errorNotice( translate( 'An unknown error has occurred. Please try again in a second.' ), {
					duration: 5000,
				} )
			);
		}
	};

	return migrateSubscribersCallback;
};
