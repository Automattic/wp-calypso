/**
 * External dependencies
 */
var React = require( 'react' ),
	noop = require( 'lodash/utility/noop' );

/**
 * Internal dependencies
 */
var analytics = require( 'analytics' ),
	SignupActions = require( 'lib/signup/actions' ),
	ThemesList = require( 'components/themes-list' ),
	WebPreview = require( 'components/web-preview' ),
	Button = require( 'components/button' ),
	ThemeHelpers = require( 'lib/themes/helpers' ),
	StepWrapper = require( 'signup/step-wrapper' );

module.exports = React.createClass( {
	displayName: 'ThemeSelection',

	propTypes: {
		themes: React.PropTypes.arrayOf( React.PropTypes.shape( {
			name: React.PropTypes.string.isRequired,
			slug: React.PropTypes.string.isRequired,
			demo_uri: React.PropTypes.string,
		} ) ),
		useHeadstart: React.PropTypes.bool,
	},

	getDefaultProps: function() {
		return {
			themes: [
				{ name: 'Boardwalk', slug: 'boardwalk', demo_uri: 'https://boardwalkdemo.wordpress.com' },
				{ name: 'Cubic', slug: 'cubic', demo_uri: 'https://cubicdemo.wordpress.com' },
				{ name: 'Edin', slug: 'edin', demo_uri: 'https://edindemo.wordpress.com' },
				{ name: 'Cols', slug: 'cols', demo_uri: 'https://colsdemo.wordpress.com' },
				{ name: 'Minnow', slug: 'minnow', demo_uri: 'https://minnowdemo.wordpress.com' },
				{ name: 'Sequential', slug: 'sequential', demo_uri: 'https://sequentialdemo.wordpress.com' },
				{ name: 'Penscratch', slug: 'penscratch', demo_uri: 'https://penscratchdemo.wordpress.com' },
				{ name: 'Intergalactic', slug: 'intergalactic', demo_uri: 'https://intergalacticdemo.wordpress.com' },
				{ name: 'Eighties', slug: 'eighties', demo_uri: 'https://eightiesdemo.wordpress.com' },
			],

			useHeadstart: false
		};
	},

	getInitialState() {
		return {
			showPreview: false,
			previewingTheme: null,
			previewUrl: null,
		}
	},

	handlePreviewButtonClick() {
		this.setState( { showPreview: false }, () => {
			analytics.tracks.recordEvent( 'calypso_signup_theme_select_preview_view', { theme: this.state.previewingTheme.id } );
			this.handleChooseTheme( this.state.previewingTheme );
		} );
	},

	closePreview() {
		this.setState( { showPreview: false } );
	},

	renderThemePreview() {
		if ( ! this.state.showPreview ) {
			return;
		}
		return (
			<WebPreview showPreview={ this.state.showPreview }
				onClose={ this.closePreview }
				previewUrl={ this.state.previewUrl } >
				<Button primary onClick={ this.handlePreviewButtonClick } >{ this.translate( 'Choose this design' ) }</Button>
			</WebPreview>
		);
	},

	handleScreenshotClick( theme ) {
		// TODO: abtest this
		if ( true ) {
			const previewUrl = ThemeHelpers.getPreviewUrl( theme );
			return this.setState( { showPreview: true, previewUrl: previewUrl, previewingTheme: theme } );
		}
		this.handleChooseTheme( theme );
	},

	handleChooseTheme( theme ) {
		var themeSlug = theme.id;

		if ( true === this.props.useHeadstart && themeSlug ) {
			analytics.tracks.recordEvent( 'calypso_signup_theme_select', { theme: themeSlug, headstart: true } );

			SignupActions.submitSignupStep( { stepName: this.props.stepName }, null, {
				theme: 'pub/' + themeSlug,
				images: undefined
			} );
		} else {
			analytics.tracks.recordEvent( 'calypso_signup_theme_select', { theme: themeSlug, headstart: false } );

			SignupActions.submitSignupStep( {
				stepName: this.props.stepName,
				processingMessage: this.translate( 'Adding your theme' ),
				themeSlug
			} );
		}

		this.props.goToNextStep();
	},

	getThemes() {
		return this.props.signupDependencies.themes || this.props.themes;
	},

	getDemoUri( theme ) {
		if ( theme.demo_uri ) {
			return theme.demo_uri;
		}

		return `https://${ theme.slug.replace( '-', '' ) }demo.wordpress.com`;
	},

	renderThemesList: function() {
		// TODO: use Preview for abtest
		const actionLabel = this.translate( 'Pick' ),
			themes = this.getThemes().map( ( theme ) => {
				return {
					id: theme.slug,
					name: theme.name,
					screenshot: 'https://i1.wp.com/s0.wp.com/wp-content/themes/pub/' + theme.slug + '/screenshot.png?w=660',
					actionLabel: actionLabel,
					demo_uri: this.getDemoUri( theme )
				}
			} );

		return (
			<div>
				{ this.renderThemePreview() }
				<ThemesList
					getButtonOptions= { noop }
					onScreenshotClick= { this.handleScreenshotClick }
					onMoreButtonClick= { noop }
					{ ...this.props }
					themes= { themes } />
			</div>
		);
	},

	render: function() {
		const defaultDependencies = this.props.useHeadstart ? { theme: 'pub/twentyfifteen', images: null } : undefined;
		return (
			<StepWrapper
				fallbackHeaderText={ this.translate( 'Choose a theme.' ) }
				fallbackSubHeaderText={ this.translate( 'No need to overthink it. You can always switch to a different theme\u00a0later.' ) }
				subHeaderText={ this.translate( 'Choose a theme. You can always switch to a different theme\u00a0later.' ) }
				stepContent={ this.renderThemesList() }
				defaultDependencies={ defaultDependencies }
				{ ...this.props } />
		);
	}
} );
