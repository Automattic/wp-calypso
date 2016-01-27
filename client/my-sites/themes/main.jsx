/**
 * External dependencies
 */
var React = require( 'react' ),
	bindActionCreators = require( 'redux' ).bindActionCreators,
	connect = require( 'react-redux' ).connect,
	pick = require( 'lodash/object/pick' );

/**
 * Internal dependencies
 */
var Main = require( 'components/main' ),
	CurrentThemeData = require( 'components/data/current-theme' ),
	ActivatingTheme = require( 'components/data/activating-theme' ),
	Action = require( 'state/themes/actions' ),
	WebPreview = require( 'components/web-preview' ),
	Button = require( 'components/button' ),
	CurrentTheme = require( 'my-sites/themes/current-theme' ),
	SidebarNavigation = require( 'my-sites/sidebar-navigation' ),
	ThanksModal = require( 'my-sites/themes/thanks-modal' ),
	config = require( 'config' ),
	EmptyContent = require( 'components/empty-content' ),
	JetpackUpgradeMessage = require( './jetpack-upgrade-message' ),
	JetpackManageDisabledMessage = require( './jetpack-manage-disabled-message' ),
	ThemesSiteSelectorModal = require( './themes-site-selector-modal' ),
	ThemesSelection = require( './themes-selection' ),
	ThemeHelpers = require( 'lib/themes/helpers' ),
	getButtonOptions = require( './theme-options' ).getButtonOptions,
	addTracking = require( './theme-options' ).addTracking,
	actionLabels = require( './action-labels' ),
	ThemesListSelectors = require( 'state/themes/themes-list/selectors' ),
	getCurrentUser = require( 'state/current-user/selectors' ).getCurrentUser,
	getSelectedSite = require( 'state/ui/selectors' ).getSelectedSite;

var Themes = React.createClass( {
	propTypes: {
		siteId: React.PropTypes.string,
		selectedSite: React.PropTypes.oneOfType( [
			React.PropTypes.object,
			React.PropTypes.bool
		] ).isRequired,
		isLoggedOut: React.PropTypes.bool.isRequired
	},

	getInitialState: function() {
		return {
			selectedTheme: null,
			selectedAction: null,
		};
	},

	renderCurrentTheme: function() {
		var site = this.props.selectedSite;
		return (
			<CurrentThemeData site={ site }>
				<CurrentTheme
					site={ site }
					canCustomize={ site && site.isCustomizable() } />
			</CurrentThemeData>
		);
	},

	renderThankYou: function() {
		return (
			<ActivatingTheme siteId={ this.props.selectedSite.ID } >
				<ThanksModal
					site={ this.props.selectedSite }
					clearActivated={ bindActionCreators( Action.clearActivated, this.props.dispatch ) } />
			</ActivatingTheme>
		);
	},

	showSiteSelectorModal: function( action, theme ) {
		this.setState( { selectedTheme: theme, selectedAction: action } );
	},

	togglePreview: function( theme ) {
		const site = this.props.selectedSite;
		if ( site.jetpack ) {
			this.props.dispatch( Action.customize( theme, site ) );
		} else {
			const previewUrl = ThemeHelpers.getPreviewUrl( theme, site );
			this.setState( { showPreview: ! this.state.showPreview, previewUrl: previewUrl, previewingTheme: theme } );
		}
	},

	hideSiteSelectorModal: function() {
		this.showSiteSelectorModal( null, null );
	},

	isThemeOrActionSet: function() {
		return this.state.selectedTheme || this.state.selectedAction;
	},

	isMultisite: function() {
		return ! this.props.siteId; // Not the same as `! site` !
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
			dispatch = this.props.dispatch,
			buttonOptions = getButtonOptions(
				site,
				this.props.isLoggedOut,
				bindActionCreators( Action, dispatch ),
				this.showSiteSelectorModal,
				this.togglePreview
			),
			getScreenshotAction = function( theme ) {
				return buttonOptions[ ( site && theme.active ) ? 'customize' : 'preview' ];
			};

		if ( isJetpack && jetpackEnabled && ! site.hasJetpackThemes ) {
			return <JetpackUpgradeMessage site={ site } />;
		}

		if ( isJetpack && jetpackEnabled && ! site.canManage() ) {
			return <JetpackManageDisabledMessage site={ site } />;
		}

		const webPreviewButtonText = this.props.isLoggedOut
			? this.translate( 'Choose this design', {
				comment: 'when signing up for a WordPress.com account with a selected theme'
			} )
			: this.translate( 'Try & Customize', {
				context: 'when previewing a theme demo, this button opens the Customizer with the previewed theme'
			} );

		return (
			<Main className="themes">
				{ this.props.isLoggedOut ? null : <SidebarNavigation /> }
				{ this.state.showPreview &&
					<WebPreview showPreview={ this.state.showPreview }
						onClose={ this.togglePreview }
						previewUrl={ this.state.previewUrl } >
						<Button primary onClick={ this.setState.bind( this, { showPreview: false },
							() => {
								if ( this.props.isLoggedOut ) {
									dispatch( Action.signup( this.state.previewingTheme ) );
								} else {
									buttonOptions.customize.action( this.state.previewingTheme );
								}
							} ) } >{ webPreviewButtonText }</Button>
					</WebPreview>
				}
				{ this.renderThankYou() }
				{ ! this.isMultisite() && this.renderCurrentTheme() }
				{ isJetpack && ! jetpackEnabled
				? this.renderJetpackMessage()
				: <ThemesSelection search={ this.props.search }
						key={ this.isMultisite() || site.ID }
						siteId={ this.props.siteId }
						selectedSite={ site }
						onScreenshotClick={ function( theme ) {
							getScreenshotAction( theme ).action( theme );
						} }
						getActionLabel={ function( theme ) {
							return getScreenshotAction( theme ).label
						} }
						getOptions={ function( theme ) {
							return pick(
								addTracking( buttonOptions ),
								option => ! ( option.hideForTheme && option.hideForTheme( theme ) )
							); } }
						trackScrollPage={ this.props.trackScrollPage }
						tier={ this.props.tier }
						queryParams={ this.props.queryParams }
						themesList={ this.props.themesList } />
				}
				{ this.isThemeOrActionSet() && <ThemesSiteSelectorModal
					name={ this.state.selectedAction /* TODO: Can we get rid of this prop? */ }
					label={ actionLabels[ this.state.selectedAction ].label }
					header={ actionLabels[ this.state.selectedAction ].header }
					selectedTheme={ this.state.selectedTheme }
					onHide={ this.hideSiteSelectorModal }
					action={ bindActionCreators( Action[ this.state.selectedAction ], dispatch ) }
				/> }
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
			isLoggedOut: ! getCurrentUser( state )
		}
	)
)( Themes );
