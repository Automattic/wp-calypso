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
	Action = require( 'state/themes/actions' ),
	ThemePreview = require( './theme-preview' ),
	SidebarNavigation = require( 'my-sites/sidebar-navigation' ),
	ThemesSiteSelectorModal = require( './themes-site-selector-modal' ),
	ThemesSelection = require( './themes-selection' ),
	ThemeHelpers = require( './helpers' ),
	actionLabels = require( './action-labels' ),
	ThemesListSelectors = require( 'state/themes/themes-list/selectors' ),
	config = require( 'config' );

var ThemesMultiSite = React.createClass( {

	getInitialState: function() {
		return {
			selectedTheme: null,
			selectedAction: null,
		};
	},

	showSiteSelectorModal: function( action, theme ) {
		this.setState( { selectedTheme: theme, selectedAction: action } );
	},

	togglePreview: function( theme ) {
		this.setState( { showPreview: ! this.state.showPreview, previewingTheme: theme } );
	},

	hideSiteSelectorModal: function() {
		this.showSiteSelectorModal( null, null );
	},

	isThemeOrActionSet: function() {
		return this.state.selectedTheme || this.state.selectedAction;
	},

	getButtonOptions: function() {
		const buttonOptions = {
			preview: {
				action: theme => this.togglePreview( theme ),
				hideForTheme: theme => theme.active
			},
			purchase: config.isEnabled( 'upgrades/checkout' )
				? {
					action: theme => this.showSiteSelectorModal( 'purchase', theme ),
					hideForTheme: theme => theme.active || theme.purchased || ! theme.price
				}
				: {},
			activate: {
				action: theme => this.showSiteSelectorModal( 'activate', theme ),
				hideForTheme: theme => theme.active || ( theme.price && ! theme.purchased )
			},
			customize: {
				action: theme => this.showSiteSelectorModal( 'customize', theme ),
				hideForTheme: theme => ! theme.active
			},
			separator: {
				separator: true
			},
			details: {
				getUrl: theme => ThemeHelpers.getDetailsUrl( theme ),
			},
			support: {
				getUrl: theme => ThemeHelpers.getSupportUrl( theme ),
				// Free themes don't have support docs.
				hideForTheme: theme => ! ThemeHelpers.isPremium( theme )
			},
		};
		return merge( {}, buttonOptions, actionLabels );
	},

	onPreviewButtonClick( theme ) {
		this.setState( { showPreview: false },
			() => {
				this.getButtonOptions().customize.action( theme );
			} );
	},

	render: function() {
		var { dispatch } = this.props,
			buttonOptions = this.getButtonOptions();

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
				<ThemesSelection search={ this.props.search }
					selectedSite={ false }
					onScreenshotClick={ function( theme ) {
						buttonOptions.preview.action( theme );
					} }
					getActionLabel={ function() {
						return buttonOptions.preview.label;
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
			themesList: ThemesListSelectors.getThemesList( state )
		}
	)
)( ThemesMultiSite );
