import config from '@automattic/calypso-config';
import { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logToLogstash } from 'calypso/lib/logstash';
import getDIFMLiteSitePageTitles from 'calypso/state/selectors/get-difm-lite-site-page-titles';
import isDIFMLiteInProgress from 'calypso/state/selectors/is-difm-lite-in-progress';
import isDIFMLiteWebsiteContentSubmitted from 'calypso/state/selectors/is-difm-lite-website-content-submitted';
import { requestSite } from 'calypso/state/sites/actions';
import { isRequestingSite } from 'calypso/state/sites/selectors';
import type { SiteId } from 'calypso/types';

/**
 * Hook that polls the /rest/v1.2/sites/<site fragment> API.
 * It checks the site details for a valid DIFM purchase.
 * A valid DIFM purchase has `.options.is_difm_lite_in_progress` set to `true`
 * and `.options.difm_lite_site_options.pages` should be an array of strings.
 * Also, `.options.difm_lite_site_options.is_website_content_submitted` should be
 * `false/null` to indicate that the users has not submitted content yet.
 *
 *
 * If the above conditions are met, the hook returns { isPollingInProgress: false, hasValidPurchase: true }.
 * If the above conditions are not met, it retries the request maxTries times,
 * with a linear backoff. If the conditions are still not met, the hook returns
 * { isPollingInProgress: false, hasValidPurchase: false }.
 * The default return value is { isPollingInProgress: true, hasValidPurchase: false }
 *
 * @param {(SiteId | null)} siteId The current site ID.
 * @param {(number)} maxTries The max number of retries
 * @returns {{
 * 	isPollingInProgress: boolean;
 * 	hasValidPurchase: boolean;
 * }}
 */
export function usePollSiteForDIFMDetails(
	siteId: SiteId | null,
	maxTries = 10
): {
	isPollingInProgress: boolean;
	pageTitles: string[] | null;
	hasValidPurchase: boolean;
} {
	const [ retryCount, setRetryCount ] = useState( 0 );
	const [ isPollingInProgress, setIsPollingInProgress ] = useState( true );
	const [ hasValidPurchase, setHasValidPurchase ] = useState( false );
	const dispatch = useDispatch();

	const isLoadingSiteInformation = useSelector( ( state ) =>
		isRequestingSite( state, siteId as number )
	);

	const pageTitles = useSelector( ( state ) => getDIFMLiteSitePageTitles( state, siteId ) );
	const isInProgress = useSelector( ( state ) => isDIFMLiteInProgress( state, siteId ) );
	const isWebsiteContentSubmitted = useSelector( ( state ) =>
		isDIFMLiteWebsiteContentSubmitted( state, siteId )
	);

	const timeout = useRef< number >();

	useEffect( () => {
		async function checkSite() {
			if ( ! siteId ) {
				return;
			}

			if ( isLoadingSiteInformation ) {
				// A request is already in progress
				return;
			}

			await dispatch( requestSite( siteId ) );

			if ( isInProgress && isWebsiteContentSubmitted !== true ) {
				setHasValidPurchase( true );
			}

			if ( pageTitles && pageTitles.length ) {
				setIsPollingInProgress( false );
			}
		}

		if ( isPollingInProgress && retryCount < maxTries ) {
			// Only refresh 10 times
			timeout.current = window.setTimeout( () => {
				setRetryCount( ( retryCount ) => retryCount + 1 );
				checkSite();
			}, retryCount * 600 );
		}

		if ( retryCount === maxTries ) {
			setIsPollingInProgress( false );
			logToLogstash( {
				feature: 'calypso_client',
				message: 'BBEX Content Form: Max retries exceeded.',
				severity: config( 'env_id' ) === 'production' ? 'error' : 'debug',
				blog_id: siteId,
				extra: {
					isInProgress,
					isWebsiteContentSubmitted,
					pageTitles,
				},
			} );
		}

		return () => {
			clearTimeout( timeout.current );
		};
	}, [
		isPollingInProgress,
		siteId,
		retryCount,
		dispatch,
		isLoadingSiteInformation,
		pageTitles,
		isInProgress,
		isWebsiteContentSubmitted,
		maxTries,
	] );

	return {
		isPollingInProgress,
		hasValidPurchase: isPollingInProgress ? false : hasValidPurchase,
		pageTitles,
	};
}
