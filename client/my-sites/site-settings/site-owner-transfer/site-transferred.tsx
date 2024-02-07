import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Button } from '@automattic/components';
import { Global, css } from '@emotion/react';
import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useState } from 'react';
import { MShotParams } from 'calypso/blocks/import/types';
import useWindowDimensions from 'calypso/blocks/import/windowDimensions.effect';
import DocumentHead from 'calypso/components/data/document-head';
import { useQueryUserPurchases } from 'calypso/components/data/query-user-purchases';
import Main from 'calypso/components/main';
import ThankYouV2 from 'calypso/components/thank-you-v2';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import MasterbarStyled from 'calypso/my-sites/checkout/checkout-thank-you/redesign-v2/masterbar-styled';
import { useSelector } from 'calypso/state';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';

const Preview = styled.img`
	border: 8px solid var( --studio-gray-0 );
	border-radius: 20px;
`;

const SiteTransferred = () => {
	useQueryUserPurchases();
	const [ mShotUrl, setMShotUrl ] = useState( '' );
	const siteId = useSelector( getSelectedSiteId );
	const { width } = useWindowDimensions();
	const mShotParams: MShotParams = {
		scale: 2,
		vpw: width <= 640 ? 640 : undefined,
	};
	const siteSlug = useSelector( getSelectedSiteSlug );
	const translate = useTranslate();
	const hasBillingPlan = true;

	const sendTrackEvent = useCallback(
		( name: string ) => {
			recordTracksEvent( name, {
				site_id: siteId,
			} );
		},
		[ siteId ]
	);

	const checkScreenshot = ( screenShotUrl: string ) => {
		const http = new XMLHttpRequest();
		http.open( 'GET', screenShotUrl );
		http.onreadystatechange = () => {
			if ( http.readyState !== http.HEADERS_RECEIVED ) {
				return;
			}

			if ( http.getResponseHeader( 'Content-Type' ) !== 'image/jpeg' ) {
				setTimeout( () => {
					checkScreenshot( screenShotUrl );
				}, 5000 );
			} else {
				setMShotUrl( screenShotUrl );
			}
		};
		http.send();
	};

	checkScreenshot(
		`https://s0.wp.com/mshots/v1/${ siteSlug }?${ Object.entries( mShotParams )
			.filter( ( entry ) => !! entry[ 1 ] )
			.map( ( [ key, val ] ) => key + '=' + val )
			.join( '&' ) }`
	);

	const thankYouHeaderAction = (
		<Button
			primary
			href={ `https://${ siteSlug }/wp-admin/plugins.php` }
			onClick={ () => {
				sendTrackEvent( 'calypso_plugin_thank_you_setup_plugins_click' );
			} }
		>
			{ hasBillingPlan ? translate( 'Setup my billing details' ) : translate( 'Upgrade my plan' ) }
		</Button>
	);

	const subtitle = hasBillingPlan
		? translate(
				"To ensure uninterrupted service, please update your billing details in the next step. After that, you're all set to explore and manage your site."
		  )
		: translate(
				'To keep your site active and access all features, please upgrade your plan in the next step and enjoy the full experience of your site.'
		  );

	return (
		<>
			<DocumentHead title={ translate( 'Site Transferred' ) } />
			<PageViewTracker path="/settings/site-transferred/:site" title="Marketplace > Thank you" />
			<Global
				styles={ css`
					body.is-section-settings,
					body.is-section-settings .layout__content {
						background: var( --studio-white );
					}
				` }
			/>
			<MasterbarStyled canGoBack={ false } />
			<Main>
				<ThankYouV2
					title={ translate( 'You now have full control' ) }
					subtitle={ subtitle }
					headerButtons={ thankYouHeaderAction }
				/>
				{ mShotUrl && <Preview src={ mShotUrl } alt="Website screenshot preview" /> }
			</Main>
		</>
	);
};

export default SiteTransferred;
