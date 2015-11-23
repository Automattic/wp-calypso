var React = require( 'react' ),
	SignupActions = require( 'lib/signup/actions' ),
	MlbThemeThumbnail = require( './mlb-theme-thumbnail' );

/**
 * Internal dependencies
 */
var StepWrapper = require( 'signup/step-wrapper' );

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
		props.themes_ = Object.keys( props.teams );
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

	renderThemes: function() {
		return (
			<div>
				<div>
					<label htmlFor="team-field">{ this.translate( 'Your team' ) }</label>
					<select onChange={ this.handleTeamSelect } name="team-field">
						{ Object.keys( this.props.teams ).map( ( key ) => {
							let team = this.props.teams[ key ];
							return <option key={ key } value={ key }>{ team }</option>;
						}.bind( this ) ) }
					</select>
				</div>
				<h3>{ this.translate( 'Theme' ) }</h3>
				<div>
					{ this.props.variations.map( function( variation ) {
						return (
							<MlbThemeThumbnail
								key={ variation }
								variation={ variation }
								team={ this.state.team }
								{ ...this.props } />
						);
					}.bind( this ) ) }
				</div>
				<div className="mlb-themes__terms">
					<h2>{ this.translate( 'MLB.com/blogs Rules') } </h2>
					<p>
						{ this.translate( 'By selecting a theme or clicking Skip, you understand that activating an MLB.com/blogs account indicates your acceptance of the {{a}}Terms of Use{{/a}}', {
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
