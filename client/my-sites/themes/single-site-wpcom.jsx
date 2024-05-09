import {
	FEATURE_UPLOAD_THEMES,
	WPCOM_PREMIUM_PLANS,
	PLAN_BUSINESS,
	PLAN_ECOMMERCE,
	getPlan,
} from '@automattic/calypso-products';
import { translate } from 'i18n-calypso';
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

const getUpgradeBannerForPlan = ( planSlug ) => {
	if ( WPCOM_PREMIUM_PLANS.includes( planSlug ) ) {
		return (
			<UpsellNudge
				className="themes__showcase-banner"
				event="calypso_themes_list_install_themes"
				feature={ FEATURE_UPLOAD_THEMES }
				plan={ PLAN_BUSINESS }
				title={
					/* translators: %(planName1)s and %(planName2)s the short-hand version of the Business and Commerce plan names */
					translate( 'Upload your own themes with our %(planName1)s and %(planName2)s plans!', {
						args: {
							planName1: getPlan( PLAN_BUSINESS )?.getTitle() ?? '',
							planName2: getPlan( PLAN_ECOMMERCE )?.getTitle() ?? '',
						},
					} )
				}
				callToAction={ translate( 'Upgrade now' ) }
				showIcon
			/>
		);
	}
};

const ConnectedSingleSiteWpcom = connectOptions( ( props ) => {
	const { currentPlan, currentThemeId, siteId, siteSlug } = props;
	useRequestSiteChecklistTaskUpdate( siteId, CHECKLIST_KNOWN_TASKS.THEMES_BROWSED );

	return (
		<Main fullWidthLayout className="themes">
			{ siteId && <QueryActiveTheme siteId={ siteId } /> }
			{ siteId && currentThemeId && (
				<QueryCanonicalTheme themeId={ currentThemeId } siteId={ siteId } />
			) }

			<ThemeShowcase
				{ ...props }
				upsellUrl={ `/plans/${ siteSlug }` }
				upsellBanner={ getUpgradeBannerForPlan( currentPlan?.productSlug ) }
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
