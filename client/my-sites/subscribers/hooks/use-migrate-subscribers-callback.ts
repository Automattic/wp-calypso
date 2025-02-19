import { useDispatch } from '@wordpress/data';
import { useTranslate } from 'i18n-calypso';
import wpcom from 'calypso/lib/wp';
import { successNotice, errorNotice } from 'calypso/state/notices/actions';

type Response = {
	success: boolean;
	message: string;
};

type ResponseWithBody = {
	body: Response;
};

export const useMigrateSubscribersCallback = () => {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const migrateSubscribersCallback: (
		sourceSiteId: number,
		targetSiteId: number
	) => Promise< void > = async ( sourceSiteId, targetSiteId ) => {
		try {
			const response = await wpcom.req
				.post(
					`/jetpack-blogs/${ encodeURIComponent( targetSiteId ) }/source/${ encodeURIComponent(
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
