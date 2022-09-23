import { isEnabled } from '@automattic/calypso-config';
import {
	FEATURE_UPLOAD_THEMES,
	PLAN_FREE,
	PLAN_PERSONAL,
	PLAN_PREMIUM,
	PLAN_BUSINESS,
	WPCOM_FEATURES_PREMIUM_THEMES,
} from '@automattic/calypso-products';
import { connect } from 'react-redux';
import UpsellNudge from 'calypso/blocks/upsell-nudge';
import Main from 'calypso/components/main';
import { useRequestSiteChecklistTaskUpdate } from 'calypso/data/site-checklist';
import CurrentTheme from 'calypso/my-sites/themes/current-theme';
import { CHECKLIST_KNOWN_TASKS } from 'calypso/state/data-layer/wpcom/checklist/index.js';
import isVipSite from 'calypso/state/selectors/is-vip-site';
import { getCurrentPlan, isRequestingSitePlans } from 'calypso/state/sites/plans/selectors';
import { getSiteSlug } from 'calypso/state/sites/selectors';
import { connectOptions } from './theme-options';
import ThemeShowcase from './theme-showcase';
import ThemesHeader from './themes-header';

const ConnectedSingleSiteWpcom = connectOptions( ( props ) => {
	const { currentPlan, isVip, requestingSitePlans, siteId, siteSlug, translate } = props;

	const displayUpsellBanner = ! requestingSitePlans && currentPlan && ! isVip;

	const upsellUrl = `/plans/${ siteSlug }`;
	let upsellBanner = null;
	if ( displayUpsellBanner ) {
		if ( isEnabled( 'themes/premium' ) ) {
			if ( [ PLAN_PERSONAL, PLAN_FREE ].includes( currentPlan.productSlug ) ) {
				upsellBanner = (
					<UpsellNudge
						className="themes__showcase-banner"
						event="calypso_themes_list_premium_themes"
						feature={ WPCOM_FEATURES_PREMIUM_THEMES }
						plan={ PLAN_PREMIUM }
						title={ translate( 'Unlock ALL premium themes with our Premium and Business plans!' ) }
						forceHref={ true }
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
						forceHref={ true }
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
					forceHref={ true }
					showIcon={ true }
				/>
			);
		}
	}

	useRequestSiteChecklistTaskUpdate( siteId, CHECKLIST_KNOWN_TASKS.THEMES_BROWSED );

	return (
		<Main fullWidthLayout className="themes">
			<ThemesHeader />
			<CurrentTheme siteId={ siteId } />

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
} ) )( ConnectedSingleSiteWpcom );
