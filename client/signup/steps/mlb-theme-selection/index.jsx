var React = require( 'react' ),
	noop = require( 'lodash/noop' );

/**
 * Internal dependencies
 */
var StepWrapper = require( 'signup/step-wrapper' ),
	analytics = require( 'analytics' ),
	SignupActions = require( 'lib/signup/actions' ),
	ThemesList = require( 'components/themes-list' );

module.exports = React.createClass( {
	displayName: 'MlbThemeSelection',
	getDefaultProps: function() {
		var props = {
			variations: [ 'Fan', 'Modern', 'Retro' ],
			teams: {
				mlb: 'MLB',
				'minor-league': 'MiLB.com',
				diamondbacks: 'Arizona Diamondbacks',
				braves: 'Atlanta Braves',
				orioles: 'Baltimore Orioles',
				redsox: 'Boston Red Sox',
				cubs: 'Chicago Cubs',
				whitesox: 'Chicago White Sox',
				reds: 'Cincinnati Reds',
				indians: 'Cleveland Indians',
				rockies: 'Colorado Rockies',
				tigers: 'Detroit Tigers',
				astros: 'Houston Astros',
				royals: 'Kansas City Royals',
				angels: 'Los Angeles Angels',
				dodgers: 'Los Angeles Dodgers',
				marlins: 'Miami Marlins',
				brewers: 'Milwaukee Brewers',
				twins: 'Minnesota Twins',
				mets: 'New York Mets',
				yankees: 'New York Yankees',
				athletics: 'Oakland Athletics',
				phillies: 'Philadelphia Phillies',
				pirates: 'Pittsburgh Pirates',
				padres: 'San Diego Padres',
				giants: 'San Francisco Giants',
				mariners: 'Seattle Mariners',
				cardinals: 'St. Louis Cardinals',
				rays: 'Tampa Bay Rays',
				rangers: 'Texas Rangers',
				bluejays: 'Toronto Blue Jays',
				nationals: 'Washington Nationals'
			}
		};
		return props;
	},

	getInitialState: function() {
		return {
			team: 'mlb'
		};
	},

	handleTeamSelect: function( event ) {
		event.preventDefault();
		this.setState( { team: event.target.value } );
	},

	getThumbnailUrl: function( team, variation ) {
		var url = 'https://i1.wp.com/s0.wp.com/wp-content/themes/vip/partner-' +
			team + '-' + variation.toLowerCase() + '/screenshot.png?w=660';
		if ( team !== 'mlb' ) {
			url = 'https://signup.wordpress.com/wp-content/mu-plugins/signup-variants/mlblogs/images/themes/' +
				variation.toLowerCase() + '/' + team + '.jpg';
		}
		return url;
	},

	handleSubmit: function( theme ) {
		var variation = theme.name,
			themeSlug = 'partner-mlb-' + variation.toLowerCase();

		analytics.tracks.recordEvent( 'calypso_mlb_signup_theme_select', { theme: themeSlug, team: this.state.team } );
		SignupActions.submitSignupStep( {
			stepName: this.props.stepName,
			processingMessage: this.translate( 'Adding your theme' ),
			themeSlug
		} );

		this.props.goToNextStep();
	},

	renderThemes: function() {
		var actionLabel = this.translate( 'Pick' ),
			themes = this.props.variations.map( ( variation ) => {
				return {
					id: variation.toLowerCase(),
					name: variation,
					screenshot: this.getThumbnailUrl( this.state.team, variation ),
					actionLabel: actionLabel
				};
			} );
		return (
			<div>
				<div className="mlb-theme-selection__team-select-container">
					<fieldset className="form-fieldset">
						<select onChange={ this.handleTeamSelect } name="team-field">
							<option key="mlb" value="mlb">{ this.translate( 'Choose your team…' ) }</option>
							{ Object.keys( this.props.teams ).map( ( key ) => {
								let team = this.props.teams[ key ];
								return <option key={ key } value={ key }>{ team }</option>;
							}.bind( this ) ) }
						</select>
					</fieldset>
				</div>
				<ThemesList
					getButtonOptions= { noop }
					onScreenshotClick= { this.handleSubmit }
					onMoreButtonClick= { noop }
					{ ...this.props }
					themes= { themes } />
				<div className="mlb-theme-selection__terms">
					<p>
						{ this.translate( 'By selecting a theme or clicking Skip, you understand that activating an MLB.com/blogs account indicates your acceptance of the {{a}}Terms of Use{{/a}}.', {
							components: {
								a: <a href="http://mlb.mlb.com/mlb/official_info/about_mlb_com/terms_of_use.jsp" target="_blank" />
							}
						} ) }
					</p>
				</div>
			</div>
		);
	},

	render: function() {
		return (
			<StepWrapper
				headerText={ this.translate( 'Welcome to MLB.com/blogs.' ) }
				fallbackHeaderText={ this.translate( 'Register.' ) }
				fallbackSubHeaderText={ this.translate( 'No need to overthink it. You can always switch to a different theme\u00a0later.' ) }
				subHeaderText={ this.translate( 'After choosing your team and theme below you\'ll be ready to start blogging.' ) }
				stepContent={ this.renderThemes() }
				{ ...this.props } />
		);
	}
} );
