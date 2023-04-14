import config from '@automattic/calypso-config';
import { getUrlParts } from '@automattic/calypso-url';
import { NewSiteSuccessResponse, Visibility } from '@automattic/data-stores';
import { getLanguage, guessTimezone } from '@automattic/i18n-utils';
import { useDispatch } from '@wordpress/data';
import { getLocaleSlug } from 'i18n-calypso';
import { useEffect } from 'react';
import wpcomRequest from 'wpcom-proxy-request';
import { redirect } from 'calypso/landing/stepper/declarative-flow/internals/steps-repository/import/util';
import { ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import type { Step } from '../../types';

import './style.scss';

const QuickSite: Step = function QuickSite( { navigation } ) {
	const { submit } = navigation;
	const { setPendingAction } = useDispatch( ONBOARD_STORE );

	useEffect( () => {
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

			const siteCreationResponse: NewSiteSuccessResponse = await wpcomRequest( {
				path: '/sites/new',
				apiVersion: '1.1',
				method: 'POST',
				body: {
					...data,
				},
			} );

			if ( ! siteCreationResponse.success ) {
				// Something went wrong. Redirect /home so the user is not stuck in the flow.
				redirect( '/home' );
			}

			const parsedBlogURL = getUrlParts( siteCreationResponse?.blog_details.url );
			const siteSlug = parsedBlogURL.hostname;

			return {
				siteSlug,
			};
		}

		setPendingAction( async () => {
			return await createSite();
		} );

		submit?.();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [] );

	return null;
};

export default QuickSite;
