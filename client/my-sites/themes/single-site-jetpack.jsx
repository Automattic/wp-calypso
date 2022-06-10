import { FEATURE_UPLOAD_THEMES, PLAN_BUSINESS } from '@automattic/calypso-products';
import { pickBy } from 'lodash';
import { connect } from 'react-redux';
import UpsellNudge from 'calypso/blocks/upsell-nudge';
import Main from 'calypso/components/main';
import { useRequestSiteChecklistTaskUpdate } from 'calypso/data/site-checklist';
import CurrentTheme from 'calypso/my-sites/themes/current-theme';
import { CHECKLIST_KNOWN_TASKS } from 'calypso/state/data-layer/wpcom/checklist/index.js';
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';
import { getCurrentPlan, isRequestingSitePlans } from 'calypso/state/sites/plans/selectors';
import { isJetpackSiteMultiSite } from 'calypso/state/sites/selectors';
import { getLastThemeQuery, getThemesFoundForQuery } from 'calypso/state/themes/selectors';
import { addTracking } from './helpers';
import { connectOptions } from './theme-options';
import ThemeShowcase from './theme-showcase';
import ThemesHeader from './themes-header';
import ThemesSelection from './themes-selection';

const ConnectedThemesSelection = connectOptions( ( props ) => {
	return (
		<ThemesSelection
			{ ...props }
			getOptions={ function ( theme ) {
				return pickBy(
					addTracking( props.options ),
					( option ) => ! ( option.hideForTheme && option.hideForTheme( theme, props.siteId ) )
				);
			} }
		/>
	);
} );

const ConnectedSingleSiteJetpack = connectOptions( ( props ) => {
	const {
		currentPlan,
		emptyContent,
		filter,
		getScreenshotOption,
		isAtomic,
		showWpcomThemesList,
		search,
		siteId,
		vertical,
		tier,
		translate,
		requestingSitePlans,
	} = props;

	const displayUpsellBanner = isAtomic && ! requestingSitePlans && currentPlan;
	const upsellUrl =
		isAtomic && `/plans/${ siteId }?feature=${ FEATURE_UPLOAD_THEMES }&plan=${ PLAN_BUSINESS }`;

	const upsellBanner = (
		<UpsellNudge
			className="themes__showcase-banner"
			event="calypso_themes_list_install_themes"
			feature={ FEATURE_UPLOAD_THEMES }
			plan={ PLAN_BUSINESS }
			title={ translate(
				'Unlock ALL premium themes and upload your own themes with our Business and eCommerce plans!'
			) }
			forceHref={ true }
			showIcon={ true }
		/>
	);

	useRequestSiteChecklistTaskUpdate( siteId, CHECKLIST_KNOWN_TASKS.THEMES_BROWSED );

	return (
		<Main fullWidthLayout className="themes">
			<ThemesHeader />
			<CurrentTheme siteId={ siteId } />
			<ThemeShowcase
				{ ...props }
				upsellUrl={ upsellUrl }
				siteId={ siteId }
				emptyContent={ showWpcomThemesList ? <div /> : null }
				isJetpackSite={ true }
				upsellBanner={ displayUpsellBanner ? upsellBanner : null }
			>
				{ showWpcomThemesList && (
					<div>
						<ConnectedThemesSelection
							origin="wpcom"
							defaultOption={ 'activate' }
							secondaryOption={ 'tryandcustomize' }
							search={ search }
							tier={ tier }
							filter={ filter }
							vertical={ vertical }
							siteId={ siteId /* This is for the options in the '...' menu only */ }
							getScreenshotUrl={ function ( theme ) {
								if ( ! getScreenshotOption( theme ).getUrl ) {
									return null;
								}
								return getScreenshotOption( theme ).getUrl( theme );
							} }
							onScreenshotClick={ function ( themeId ) {
								if ( ! getScreenshotOption( themeId ).action ) {
									return;
								}
								getScreenshotOption( themeId ).action( themeId );
							} }
							getActionLabel={ function ( theme ) {
								return getScreenshotOption( theme ).label;
							} }
							trackScrollPage={ props.trackScrollPage }
							source="wpcom"
							emptyContent={ emptyContent }
						/>
					</div>
				) }
			</ThemeShowcase>
		</Main>
	);
} );

export default connect( ( state, { siteId, tier } ) => {
	const currentPlan = getCurrentPlan( state, siteId );
	const isMultisite = isJetpackSiteMultiSite( state, siteId );
	const showWpcomThemesList = ! isMultisite;
	let emptyContent = null;
	if ( showWpcomThemesList ) {
		const siteQuery = getLastThemeQuery( state, siteId );
		const wpcomQuery = getLastThemeQuery( state, 'wpcom' );
		const siteThemesCount = getThemesFoundForQuery( state, siteId, siteQuery );
		const wpcomThemesCount = getThemesFoundForQuery( state, 'wpcom', wpcomQuery );
		emptyContent = ! siteThemesCount && ! wpcomThemesCount ? null : <div />;
	}
	return {
		currentPlan,
		tier,
		showWpcomThemesList,
		emptyContent,
		isAtomic: isAtomicSite( state, siteId ),
		isMultisite,
		requestingSitePlans: isRequestingSitePlans( state, siteId ),
	};
} )( ConnectedSingleSiteJetpack );
