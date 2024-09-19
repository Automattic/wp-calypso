import {
	FEATURE_UPLOAD_THEMES,
	PLAN_BUSINESS,
	PLAN_ECOMMERCE,
	PLAN_ECOMMERCE_TRIAL_MONTHLY,
	getPlan,
} from '@automattic/calypso-products';
import { connect } from 'react-redux';
import UpsellNudge from 'calypso/blocks/upsell-nudge';
import QueryActiveTheme from 'calypso/components/data/query-active-theme';
import QueryCanonicalTheme from 'calypso/components/data/query-canonical-theme';
import { JetpackConnectionHealthBanner } from 'calypso/components/jetpack/connection-health';
import Main from 'calypso/components/main';
import { useRequestSiteChecklistTaskUpdate } from 'calypso/data/site-checklist';
import { CHECKLIST_KNOWN_TASKS } from 'calypso/state/data-layer/wpcom/checklist/index.js';
import { withJetpackConnectionProblem } from 'calypso/state/jetpack-connection-health/selectors/is-jetpack-connection-problem';
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';
import { getCurrentPlan, isRequestingSitePlans } from 'calypso/state/sites/plans/selectors';
import { isJetpackSiteMultiSite } from 'calypso/state/sites/selectors';
import { getActiveTheme } from 'calypso/state/themes/selectors';
import { connectOptions } from './theme-options';
import ThemeShowcase from './theme-showcase';

const ConnectedSingleSiteJetpack = connectOptions( ( props ) => {
	const {
		currentPlan,
		currentThemeId,
		isAtomic,
		isPossibleJetpackConnectionProblem,
		siteId,
		translate,
		requestingSitePlans,
	} = props;

	const isWooExpressTrial = PLAN_ECOMMERCE_TRIAL_MONTHLY === currentPlan?.productSlug;

	const upsellBanner = () => {
		if ( isWooExpressTrial ) {
			return (
				<UpsellNudge
					className="themes__showcase-banner"
					event="calypso_themes_list_install_themes"
					feature={ FEATURE_UPLOAD_THEMES }
					title={ translate( 'Upgrade to a plan to upload your own themes!' ) }
					callToAction={ translate( 'Upgrade now' ) }
					showIcon
				/>
			);
		}

		return (
			<UpsellNudge
				className="themes__showcase-banner"
				event="calypso_themes_list_install_themes"
				feature={ FEATURE_UPLOAD_THEMES }
				plan={ PLAN_BUSINESS }
				title={
					/* translators: %(planName1)s and %(planName2)s are the short-hand version of the Business and Commerce plan names */
					translate(
						'Unlock ALL premium themes and upload your own themes with our %(planName1)s and %(planName2)s plans!',
						{
							args: {
								planName1: getPlan( PLAN_BUSINESS )?.getTitle() ?? '',
								planName2: getPlan( PLAN_ECOMMERCE )?.getTitle() ?? '',
							},
						}
					)
				}
				callToAction={ translate( 'Upgrade now' ) }
				showIcon
			/>
		);
	};

	const upsellUrl = () => {
		if ( isWooExpressTrial ) {
			return `/plans/${ siteId }?feature=${ FEATURE_UPLOAD_THEMES }&plan=${ PLAN_ECOMMERCE }`;
		}

		return (
			isAtomic && `/plans/${ siteId }?feature=${ FEATURE_UPLOAD_THEMES }&plan=${ PLAN_BUSINESS }`
		);
	};

	const displayUpsellBanner = isAtomic && ! requestingSitePlans && currentPlan;

	useRequestSiteChecklistTaskUpdate( siteId, CHECKLIST_KNOWN_TASKS.THEMES_BROWSED );

	return (
		<Main fullWidthLayout className="themes">
			<QueryActiveTheme siteId={ siteId } />
			{ currentThemeId && <QueryCanonicalTheme themeId={ currentThemeId } siteId={ siteId } /> }

			{ isPossibleJetpackConnectionProblem && <JetpackConnectionHealthBanner siteId={ siteId } /> }

			<ThemeShowcase
				{ ...props }
				upsellUrl={ upsellUrl() }
				siteId={ siteId }
				isJetpackSite
				upsellBanner={ displayUpsellBanner ? upsellBanner() : null }
			/>
		</Main>
	);
} );

export default connect( ( state, { siteId, tier } ) => {
	const currentPlan = getCurrentPlan( state, siteId );
	const currentThemeId = getActiveTheme( state, siteId );
	const isMultisite = isJetpackSiteMultiSite( state, siteId );
	const showWpcomThemesList = ! isMultisite;
	return {
		currentPlan,
		currentThemeId,
		tier,
		showWpcomThemesList,
		isAtomic: isAtomicSite( state, siteId ),
		isMultisite,
		requestingSitePlans: isRequestingSitePlans( state, siteId ),
	};
} )( withJetpackConnectionProblem( ConnectedSingleSiteJetpack ) );
