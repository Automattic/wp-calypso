import { isEnabled } from '@automattic/calypso-config';
import {
	FEATURE_UPLOAD_THEMES,
	PLAN_PREMIUM,
	PLAN_ECOMMERCE,
	PLAN_BUSINESS,
	getPlan,
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
		const commonProps = {
			className: 'themes__showcase-banner',
			event: 'calypso_themes_list_install_themes',
			feature: FEATURE_UPLOAD_THEMES,
			plan: PLAN_BUSINESS,
			title:
				/* translators: %(planName1)s and %(planName2)s the short-hand version of the Business and Commerce plan names */
				translate( 'Upload your own themes with our %(planName1)s and %(planName2)s plans!', {
					args: {
						planName1: getPlan( PLAN_BUSINESS )?.getTitle() ?? '',
						planName2: getPlan( PLAN_ECOMMERCE )?.getTitle() ?? '',
					},
				} ),
			callToAction: translate( 'Upgrade now' ),
			showIcon: true,
		};

		if ( isEnabled( 'themes/premium' ) ) {
			if ( currentPlan.productSlug === PLAN_PREMIUM ) {
				upsellBanner = <UpsellNudge { ...commonProps } />;
			}
		} else {
			upsellBanner = <UpsellNudge { ...commonProps } />;
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
