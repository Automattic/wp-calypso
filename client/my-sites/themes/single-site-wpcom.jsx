import { isEnabled } from '@automattic/calypso-config';
import {
	FEATURE_UPLOAD_THEMES,
	PLAN_FREE,
	PLAN_PERSONAL,
	PLAN_PREMIUM,
	PLAN_BUSINESS,
	FEATURE_PREMIUM_THEMES_V2,
} from '@automattic/calypso-products';
import { connect } from 'react-redux';
import UpsellNudge from 'calypso/blocks/upsell-nudge';
import QueryActiveTheme from 'calypso/components/data/query-active-theme';
import QueryCanonicalTheme from 'calypso/components/data/query-canonical-theme';
import Main from 'calypso/components/main';
import { useRequestSiteChecklistTaskUpdate } from 'calypso/data/site-checklist';
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

	const displayUpsellBanner = ! requestingSitePlans && currentPlan && ! isVip && siteId;
	const upsellUrl = `/plans/${ siteSlug }`;
	let upsellBanner = null;
	if ( displayUpsellBanner ) {
		if ( isEnabled( 'themes/premium' ) ) {
			if ( [ PLAN_PERSONAL, PLAN_FREE ].includes( currentPlan.productSlug ) ) {
				upsellBanner = (
					<UpsellNudge
						className="themes__showcase-banner"
						event="calypso_themes_list_premium_themes"
						feature={ FEATURE_PREMIUM_THEMES_V2 }
						plan={ PLAN_PREMIUM }
						title={ translate( 'Unlock premium themes with our Premium and Business plans!' ) }
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
			{ siteId && <QueryActiveTheme siteId={ siteId } /> }
			{ siteId && currentThemeId && (
				<QueryCanonicalTheme themeId={ currentThemeId } siteId={ siteId } />
			) }

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
