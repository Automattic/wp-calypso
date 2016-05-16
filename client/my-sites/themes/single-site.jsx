/**
 * External dependencies
 */
import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import pickBy from 'lodash/pickBy';
import merge from 'lodash/merge';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import ActivatingTheme from 'components/data/activating-theme';
import { customize, purchase, activate, clearActivated } from 'state/themes/actions';
import ThemePreview from './theme-preview';
import CurrentTheme from 'my-sites/themes/current-theme';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import ThanksModal from 'my-sites/themes/thanks-modal';
import config from 'config';
import EmptyContent from 'components/empty-content';
import JetpackUpgradeMessage from './jetpack-upgrade-message';
import JetpackManageDisabledMessage from './jetpack-manage-disabled-message';
import ThemesSelection from './themes-selection';
import { getDetailsUrl, getSupportUrl, isPremium, addTracking } from './helpers';
import actionLabels from './action-labels';
import { getQueryParams, getThemesList } from 'state/themes/themes-list/selectors';
import sitesFactory from 'lib/sites-list';
import { FEATURE_CUSTOM_DESIGN } from 'lib/plans/constants';
import UpgradeNudge from 'my-sites/upgrade-nudge';

const sites = sitesFactory();

const ThemesSingleSite = React.createClass( {
	propTypes: {
		siteId: React.PropTypes.string,
		tier: React.PropTypes.string,
		search: React.PropTypes.string,
		trackScrollPage: React.PropTypes.func,
		// Connected Props
		queryParams: React.PropTypes.object,
		themesList: React.PropTypes.array
	},

	getInitialState() {
		return {
			selectedTheme: null,
			selectedAction: null,
		};
	},

	togglePreview( theme ) {
		const site = sites.getSelectedSite();
		if ( site.jetpack ) {
			this.props.dispatch( customize( theme, site ) );
		} else {
			this.setState( { showPreview: ! this.state.showPreview, previewingTheme: theme } );
		}
	},

	getButtonOptions() {
		const { dispatch } = this.props,
			site = sites.getSelectedSite(),
			buttonOptions = {
				preview: {
					action: theme => this.togglePreview( theme ),
					hideForTheme: theme => theme.active
				},
				purchase: config.isEnabled( 'upgrades/checkout' )
					? {
						action: theme => dispatch( purchase( theme, site, 'showcase' ) ),
						hideForTheme: theme => theme.active || theme.purchased || ! theme.price
					}
					: {},
				activate: {
					action: theme => dispatch( activate( theme, site, 'showcase' ) ),
					hideForTheme: theme => theme.active || ( theme.price && ! theme.purchased )
				},
				customize: site && site.isCustomizable()
					? {
						action: theme => dispatch( customize( theme, site ) ),
						hideForTheme: theme => ! theme.active
					}
					: {},
				separator: {
					separator: true
				},
				details: {
					getUrl: theme => getDetailsUrl( theme, site ),
				},
				support: ! site.jetpack // We don't know where support docs for a given theme on a self-hosted WP install are.
					? {
						getUrl: theme => getSupportUrl( theme, site ),
						hideForTheme: theme => ! isPremium( theme )
					}
					: {},
			};

		return merge( {}, buttonOptions, actionLabels );
	},

	onPreviewButtonClick( theme ) {
		this.setState( { showPreview: false },
			() => {
				this.getButtonOptions().customize.action( theme );
			} );
	},

	renderJetpackMessage() {
		const site = sites.getSelectedSite();
		return (
			<EmptyContent title={ this.translate( 'Changing Themes?' ) }
				line={ this.translate( 'Use your site theme browser to manage themes.' ) }
				action={ this.translate( 'Open Site Theme Browser' ) }
				actionURL={ site.options.admin_url + 'themes.php' }
				actionTarget="_blank"
				illustration="/calypso/images/drake/drake-jetpack.svg" />
		);
	},

	render() {
		const site = sites.getSelectedSite(),
			isJetpack = site.jetpack,
			jetpackEnabled = config.isEnabled( 'manage/themes-jetpack' ),
			buttonOptions = this.getButtonOptions(),
			getScreenshotAction = function( theme ) {
				return buttonOptions[ theme.active ? 'customize' : 'preview' ];
			};

		if ( isJetpack && jetpackEnabled && ! site.hasJetpackThemes ) {
			return <JetpackUpgradeMessage site={ site } />;
		}

		if ( isJetpack && jetpackEnabled && ! site.canManage() ) {
			return <JetpackManageDisabledMessage site={ site } />;
		}

		return (
			<Main className="themes">
				<SidebarNavigation />
				{ this.state.showPreview &&
					<ThemePreview showPreview={ this.state.showPreview }
						theme={ this.state.previewingTheme }
						onClose={ this.togglePreview }
						buttonLabel={ this.translate( 'Try & Customize', {
							context: 'when previewing a theme demo, this button opens the Customizer with the previewed theme'
						} ) }
						onButtonClick={ this.onPreviewButtonClick } />
				}
				<ActivatingTheme siteId={ site.ID } >
					<ThanksModal
						site={ site }
						source={ 'list' }
						clearActivated={ bindActionCreators( clearActivated, this.props.dispatch ) } />
				</ActivatingTheme>
				<CurrentTheme
					site={ site }
					canCustomize={ site && site.isCustomizable() } />
				<UpgradeNudge
					title={ this.translate( 'Get Custom Design with Premium' ) }
					message={ this.translate( 'Customize your theme using premium fonts, color palettes, and the CSS editor.' ) }
					feature={ FEATURE_CUSTOM_DESIGN }
					event="themes_custom_design"
				/>
				{ isJetpack && ! jetpackEnabled
				? this.renderJetpackMessage()
				: <ThemesSelection search={ this.props.search }
						key={ site.ID }
						siteId={ this.props.siteId }
						selectedSite={ site }
						onScreenshotClick={ function( theme ) {
							getScreenshotAction( theme ).action( theme );
						} }
						getActionLabel={ function( theme ) {
							return getScreenshotAction( theme ).label;
						} }
						getOptions={ function( theme ) {
							return pickBy(
								addTracking( buttonOptions ),
								option => ! ( option.hideForTheme && option.hideForTheme( theme ) )
							); } }
						trackScrollPage={ this.props.trackScrollPage }
						tier={ this.props.tier }
						queryParams={ this.props.queryParams }
						themesList={ this.props.themesList } />
				}
			</Main>
		);
	}
} );

export default connect(
	state => ( {
		queryParams: getQueryParams( state ),
		themesList: getThemesList( state )
	} )
)( ThemesSingleSite );
