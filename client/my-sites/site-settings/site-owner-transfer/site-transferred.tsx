import { recordTracksEvent } from '@automattic/calypso-analytics';
import { PLAN_BUSINESS, isFreePlan, isBusinessTrial } from '@automattic/calypso-products';
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
import { getAddNewPaymentMethodUrlFor } from 'calypso/my-sites/purchases/paths';
import { useSelector } from 'calypso/state';
import isPrivateSite from 'calypso/state/selectors/is-private-site';
import isSiteComingSoon from 'calypso/state/selectors/is-site-coming-soon';
import { getSitePlanSlug } from 'calypso/state/sites/selectors';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';

const Preview = styled.img`
	border: 8px solid var( --studio-gray-0 );
	border-radius: 20px;
`;

const MainStyled = styled( Main )`
	padding: 0 20px;
`;

const SiteTransferred = () => {
	useQueryUserPurchases();
	const translate = useTranslate();
	const [ mShotUrl, setMShotUrl ] = useState( '' );
	const siteId = useSelector( getSelectedSiteId );
	const sitePlanSlug = useSelector( ( state ) => getSitePlanSlug( state, siteId ) ?? '' );
	const siteSlug = useSelector( getSelectedSiteSlug ) || '';
	const isPrivate = useSelector( ( state ) => ( siteId ? isPrivateSite( state, siteId ) : true ) );
	const isComingSoon = useSelector( ( state ) =>
		siteId ? isSiteComingSoon( state, siteId ) : true
	);
	const isPrivateOrComingSoon = isPrivate || isComingSoon;
	const shouldBuyBusinessPlan = isBusinessTrial( sitePlanSlug );
	const hasNoPlan = isFreePlan( sitePlanSlug );
	const { width } = useWindowDimensions();
	const mShotParams: MShotParams = {
		scale: 2,
		vpw: width <= 640 ? 640 : undefined,
	};

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

	if ( ! isPrivateOrComingSoon ) {
		checkScreenshot(
			`https://s0.wp.com/mshots/v1/${ siteSlug }?${ Object.entries( mShotParams )
				.filter( ( entry ) => !! entry[ 1 ] )
				.map( ( [ key, val ] ) => key + '=' + val )
				.join( '&' ) }`
		);
	}

	const thankYouHeaderAction = hasNoPlan ? (
		<Button
			primary
			href={ `/home/${ siteSlug }` }
			onClick={ () => {
				sendTrackEvent( 'calypso_transferred_site_next_step_click_no_plan' );
			} }
		>
			{ translate( 'Continue' ) }
		</Button>
	) : (
		<Button
			primary
			href={
				shouldBuyBusinessPlan
					? `/checkout/${ siteSlug }/${ PLAN_BUSINESS }`
					: getAddNewPaymentMethodUrlFor( siteSlug )
			}
			onClick={ () => {
				sendTrackEvent( 'calypso_transferred_site_next_step_click' );
			} }
		>
			{ shouldBuyBusinessPlan
				? translate( 'Proceed to Checkout' )
				: translate( 'Update billing details' ) }
		</Button>
	);

	const title = shouldBuyBusinessPlan
		? translate( 'Your site is on a free trial.' )
		: translate( "You're now in charge." );

	const subtitle = shouldBuyBusinessPlan
		? translate(
				'To keep your site active and access all features, please upgrade your plan in the next step and enjoy the full experience of your site.'
		  )
		: translate(
				"Continue to full ownership by signing up for our exclusive plan. Enter your billing details and maintain your site's momentum!"
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
			<MainStyled>
				<ThankYouV2
					title={ title }
					subtitle={ hasNoPlan ? '' : subtitle }
					headerButtons={ thankYouHeaderAction }
				/>
				{ ! isPrivateOrComingSoon && mShotUrl && (
					<Preview src={ mShotUrl } alt="Website screenshot preview" />
				) }
			</MainStyled>
		</>
	);
};

export default SiteTransferred;
