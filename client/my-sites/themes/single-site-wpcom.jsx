import { isEnabled } from '@automattic/calypso-config';
import {
	FEATURE_UPLOAD_THEMES,
	PLAN_FREE,
	PLAN_PERSONAL,
	PLAN_PREMIUM,
	PLAN_BUSINESS,
	WPCOM_FEATURES_PREMIUM_THEMES,
} from '@automattic/calypso-products';
import { useIsEnglishLocale } from '@automattic/i18n-utils';
import i18n from 'i18n-calypso';
import { connect } from 'react-redux';
import UpsellNudge from 'calypso/blocks/upsell-nudge';
import QueryActiveTheme from 'calypso/components/data/query-active-theme';
import QueryCanonicalTheme from 'calypso/components/data/query-canonical-theme';
import Main from 'calypso/components/main';
import { useRequestSiteChecklistTaskUpdate } from 'calypso/data/site-checklist';
import BodySectionCssClass from 'calypso/layout/body-section-css-class';
import { CHECKLIST_KNOWN_TASKS } from 'calypso/state/data-layer/wpcom/checklist/index.js';
import isVipSite from 'calypso/state/selectors/is-vip-site';
import { getCurrentPlan, isRequestingSitePlans } from 'calypso/state/sites/plans/selectors';
import { getSiteSlug } from 'calypso/state/sites/selectors';
import { getActiveTheme } from 'calypso/state/themes/selectors';
import { connectOptions } from './theme-options';
import ThemeShowcase from './theme-showcase';

const ConnectedSingleSiteWpcom = connectOptions( ( props ) => {
	const { currentPlan, currentThemeId, isVip, requestingSitePlans, siteId, siteSlug, translate } =
		props;

	const isNewCardsOnly = isEnabled( 'themes/showcase-i4/cards-only' );
	const isNewDetailsAndPreview = isEnabled( 'themes/showcase-i4/details-and-preview' );
	const displayUpsellBanner = ! requestingSitePlans && currentPlan && ! isVip;
	const upsellUrl = `/plans/${ siteSlug }`;
	const isEnglishLocale = useIsEnglishLocale();
	let upsellBanner = null;
	if ( displayUpsellBanner ) {
		if ( isEnabled( 'themes/premium' ) ) {
			if ( [ PLAN_PERSONAL, PLAN_FREE ].includes( currentPlan.productSlug ) ) {
				const bannerTitle =
					isEnglishLocale ||
					i18n.hasTranslation( 'Unlock premium themes with our Premium and Business plans!' )
						? translate( 'Unlock premium themes with our Premium and Business plans!' )
						: translate( 'Unlock ALL premium themes with our Premium and Business plans!' );
				upsellBanner = (
					<UpsellNudge
						className="themes__showcase-banner"
						event="calypso_themes_list_premium_themes"
						feature={ WPCOM_FEATURES_PREMIUM_THEMES }
						plan={ PLAN_PREMIUM }
						title={ bannerTitle }
						callToAction={ translate( 'Upgrade now' ) }
						showIcon={ true }
					/>
				);
			}

			if ( currentPlan.productSlug === PLAN_PREMIUM ) {
				upsellBanner = (
					<UpsellNudge
						className="themes__showcase-banner"
						event="calypso_themes_list_install_themes"
						feature={ FEATURE_UPLOAD_THEMES }
						plan={ PLAN_BUSINESS }
						title={ translate( 'Upload your own themes with our Business and eCommerce plans!' ) }
						callToAction={ translate( 'Upgrade now' ) }
						showIcon={ true }
					/>
				);
			}
		} else {
			upsellBanner = (
				<UpsellNudge
					className="themes__showcase-banner"
					event="calypso_themes_list_install_themes"
					feature={ FEATURE_UPLOAD_THEMES }
					plan={ PLAN_BUSINESS }
					title={ translate( 'Upload your own themes with our Business and eCommerce plans!' ) }
					callToAction={ translate( 'Upgrade now' ) }
					showIcon={ true }
				/>
			);
		}
	}

	useRequestSiteChecklistTaskUpdate( siteId, CHECKLIST_KNOWN_TASKS.THEMES_BROWSED );

	return (
		<Main fullWidthLayout className="themes">
			<BodySectionCssClass
				bodyClass={ [
					...( isNewCardsOnly ? [ 'is-section-themes-i4-cards-only' ] : [] ),
					...( isNewDetailsAndPreview ? [ 'is-section-themes-i4-2' ] : [] ),
				] }
			/>
			<QueryActiveTheme siteId={ siteId } />
			{ currentThemeId && <QueryCanonicalTheme themeId={ currentThemeId } siteId={ siteId } /> }

			<ThemeShowcase
				{ ...props }
				upsellUrl={ upsellUrl }
				upsellBanner={ upsellBanner }
				siteId={ siteId }
			/>
		</Main>
	);
} );

export default connect( ( state, { siteId } ) => ( {
	isVip: isVipSite( state, siteId ),
	siteSlug: getSiteSlug( state, siteId ),
	requestingSitePlans: isRequestingSitePlans( state, siteId ),
	currentPlan: getCurrentPlan( state, siteId ),
	currentThemeId: getActiveTheme( state, siteId ),
} ) )( ConnectedSingleSiteWpcom );
