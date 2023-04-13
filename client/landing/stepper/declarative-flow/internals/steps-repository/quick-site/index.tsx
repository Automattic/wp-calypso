import config from '@automattic/calypso-config';
import { Visibility } from '@automattic/data-stores';
import { getLanguage, guessTimezone } from '@automattic/i18n-utils';
import { useDispatch } from '@wordpress/data';
import { getLocaleSlug } from 'i18n-calypso';
import { useEffect } from 'react';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import wpcom from 'calypso/lib/wp';
import type { Step } from '../../types';

const wait = ( ms: number ) => new Promise( ( res ) => setTimeout( res, ms ) );

const QuickSite: Step = function QuickSite( { navigation } ) {
	const { submit } = navigation;
	const urlQueryParams = useQuery();
	const siteSlug = urlQueryParams.get( 'siteSlug' );
	const { setPendingAction, setProgress } = useDispatch( ONBOARD_STORE );

	useEffect( () => {
		// eslint-disable-next-line no-console
		console.log( 'QuickSite useEffect' );
		async function createSite() {
			const locale = getLocaleSlug();
			const data = {
				blog_name: '',
				blog_title: '',
				public: Visibility.PublicNotIndexed,
				options: {
					timezone_string: guessTimezone(),
					wpcom_public_coming_soon: 1,
					site_creation_flow: 'free',
				},
				validate: false,
				locale,
				lang_id: getLanguage( locale ?? undefined )?.value,
				client_id: config( 'wpcom_signup_id' ),
				client_secret: config( 'wpcom_signup_key' ),
				find_available_url: true,
			};

			await wpcom.req.post( '/sites/new', data );
		}
		createSite();
		setPendingAction( async () => {
			setProgress( 10 );

			await wait( 6000 );

			submit?.();

			return { finishedQuickCreate: true, siteSlug };
		} );

		submit?.();
	}, [] );

	return null;
};

export default QuickSite;
