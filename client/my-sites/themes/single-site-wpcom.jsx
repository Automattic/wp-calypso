/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import pickBy from 'lodash/pickBy';

/**
 * Internal dependencies
 */
import CurrentTheme from 'my-sites/themes/current-theme';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import ThanksModal from 'my-sites/themes/thanks-modal';
import { connectOptions } from './theme-options';
import { addTracking } from './helpers';
import { FEATURE_ADVANCED_DESIGN } from 'lib/plans/constants';
import UpgradeNudge from 'my-sites/upgrade-nudge';
import QuerySitePlans from 'components/data/query-site-plans';
import QuerySitePurchases from 'components/data/query-site-purchases';
import ThemeShowcase from './theme-showcase';
import ThemesSelection from './themes-selection';

const ThemesSelectionConnected = connectOptions( ThemesSelection );

const SingleSiteThemeShowcaseWpcom = React.createClass( {
	propTypes: {
		getScreenshotOption: PropTypes.func,
	},

	render() {
		const { site, siteId, getScreenshotOption, search, options, translate } = this.props;

		return (
			<div>
				<ThemeShowcase { ...this.props } siteId={ siteId }>
					{ siteId && <QuerySitePlans siteId={ siteId } /> }
					{ siteId && <QuerySitePurchases siteId={ siteId } /> }
					<SidebarNavigation />
					<ThanksModal
						site={ site }
						source={ 'list' } />
					<CurrentTheme siteId={ siteId } />
					<UpgradeNudge
						title={ translate( 'Get Custom Design with Premium' ) }
						message={ translate( 'Customize your theme using premium fonts, color palettes, and the CSS editor.' ) }
						feature={ FEATURE_ADVANCED_DESIGN }
						event="themes_custom_design"
						/>
				</ThemeShowcase>
				<ThemesSelectionConnected
					site={ site }
					siteId={ siteId }
					options={ [
						'customize',
						'preview',
						'purchase',
						'activate',
						'tryandcustomize',
						'separator',
						'info',
						'support',
						'help'
					] }
					defaultOption="activate"
					secondaryOption="tryandcustomize"
					source="showcase"

					selectedSite={ this.props.selectedSite }
					getScreenshotUrl={ function( theme ) {
						if ( ! getScreenshotOption( theme ).getUrl ) {
							return null;
						}
						return getScreenshotOption( theme ).getUrl( theme );
					} }
					onScreenshotClick={ function( theme ) {
						if ( ! getScreenshotOption( theme ).action ) {
							return;
						}
						getScreenshotOption( theme ).action( theme );
					} }
					getActionLabel={ function( theme ) {
						return getScreenshotOption( theme ).label;
					} }
					getOptions={ function( theme ) {
						return pickBy(
							addTracking( options ),
							option => ! ( option.hideForTheme && option.hideForTheme( theme ) )
						); } }
					trackScrollPage={ this.props.trackScrollPage }
					search={ search }
					tier={ this.props.tier }
					filter={ this.props.filter }
					vertical={ this.props.vertical }
					queryParams={ this.props.queryParams }
					themesList={ this.props.themesList } />
			</div>
		);
	}
} );

export default SingleSiteThemeShowcaseWpcom;
