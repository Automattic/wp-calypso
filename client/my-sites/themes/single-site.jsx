/**
 * External dependencies
 */
var React = require( 'react' ),
	bindActionCreators = require( 'redux' ).bindActionCreators,
	connect = require( 'react-redux' ).connect,
	pickBy = require( 'lodash/pickBy' ),
	merge = require( 'lodash/merge' );

/**
 * Internal dependencies
 */
var Main = require( 'components/main' ),
	CurrentThemeData = require( 'components/data/current-theme' ),
	ActivatingTheme = require( 'components/data/activating-theme' ),
	Action = require( 'state/themes/actions' ),
	ThemePreview = require( './theme-preview' ),
	CurrentTheme = require( 'my-sites/themes/current-theme' ),
	SidebarNavigation = require( 'my-sites/sidebar-navigation' ),
	ThanksModal = require( 'my-sites/themes/thanks-modal' ),
	config = require( 'config' ),
	EmptyContent = require( 'components/empty-content' ),
	JetpackUpgradeMessage = require( './jetpack-upgrade-message' ),
	JetpackManageDisabledMessage = require( './jetpack-manage-disabled-message' ),
	ThemesSelection = require( './themes-selection' ),
	ThemeHelpers = require( './helpers' ),
	actionLabels = require( './action-labels' ),
	ThemesListSelectors = require( 'state/themes/themes-list/selectors' ),
	getSelectedSite = require( 'state/ui/selectors' ).getSelectedSite;

var ThemesSingleSite = React.createClass( {
	propTypes: {
		siteId: React.PropTypes.string,
		tier: React.PropTypes.string,
		search: React.PropTypes.string,
		trackScrollPage: React.PropTypes.func,
		// Connected Props
		queryParams: React.PropTypes.object,
		themesList: React.PropTypes.array,
		selectedSite: React.PropTypes.oneOfType( [
			React.PropTypes.object,
			React.PropTypes.bool
		] ).isRequired,
	},

	getInitialState: function() {
		return {
			selectedTheme: null,
			selectedAction: null,
		};
	},

	togglePreview: function( theme ) {
		const site = this.props.selectedSite;
		if ( site.jetpack ) {
			this.props.dispatch( Action.customize( theme, site ) );
		} else {
			this.setState( { showPreview: ! this.state.showPreview, previewingTheme: theme } );
		}
	},

	getButtonOptions: function() {
		const { dispatch, selectedSite: site } = this.props,
			buttonOptions = {
				preview: {
					action: theme => this.togglePreview( theme ),
					hideForTheme: theme => theme.active
				},
				purchase: config.isEnabled( 'upgrades/checkout' )
					? {
						action: theme => dispatch( Action.purchase( theme, site, 'showcase' ) ),
						hideForTheme: theme => theme.active || theme.purchased || ! theme.price
					}
					: {},
				activate: {
					action: theme => dispatch( Action.activate( theme, site, 'showcase' ) ),
					hideForTheme: theme => theme.active || ( theme.price && ! theme.purchased )
				},
				customize: site && site.isCustomizable()
					? {
						action: theme => dispatch( Action.customize( theme, site ) ),
						hideForTheme: theme => ! theme.active
					}
					: {},
				separator: {
					separator: true
				},
				details: {
					getUrl: theme => ThemeHelpers.getDetailsUrl( theme, site ),
				},
				support: site.jetpack // We don't know where support docs for a given theme on a self-hosted WP install are.
					? {
						getUrl: theme => ThemeHelpers.getSupportUrl( theme, site ),
						hideForTheme: theme => ! ThemeHelpers.isPremium( theme )
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

	renderJetpackMessage: function() {
		var site = this.props.selectedSite;
		return (
			<EmptyContent title={ this.translate( 'Changing Themes?' ) }
				line={ this.translate( 'Use your site theme browser to manage themes.' ) }
				action={ this.translate( 'Open Site Theme Browser' ) }
				actionURL={ site.options.admin_url + 'themes.php' }
				actionTarget="_blank"
				illustration="/calypso/images/drake/drake-jetpack.svg" />
		);
	},

	render: function() {
		var site = this.props.selectedSite,
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
				<ActivatingTheme siteId={ this.props.selectedSite.ID } >
					<ThanksModal
						site={ this.props.selectedSite }
						clearActivated={ bindActionCreators( Action.clearActivated, this.props.dispatch ) } />
				</ActivatingTheme>
				<CurrentThemeData site={ site }>
					<CurrentTheme
						site={ site }
						canCustomize={ site && site.isCustomizable() } />
				</CurrentThemeData>
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
							return getScreenshotAction( theme ).label
						} }
						getOptions={ function( theme ) {
							return pickBy(
								ThemeHelpers.addTracking( buttonOptions ),
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
	( state, props ) => Object.assign( {},
		props,
		{
			queryParams: ThemesListSelectors.getQueryParams( state ),
			themesList: ThemesListSelectors.getThemesList( state ),
			selectedSite: getSelectedSite( state ) || false,
		}
	)
)( ThemesSingleSite );
