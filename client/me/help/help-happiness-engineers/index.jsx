/**
 * External dependencies
 */
var React = require( 'react' ),
	PureRenderMixin = require( 'react-pure-render/mixin' );

/**
 * Internal dependencies
 */
var HappinessEngineersStore = require( 'lib/happiness-engineers/store' ),
	HappinessEngineersActions = require( 'lib/happiness-engineers/actions' ),
	FormSectionHeading = require( 'components/forms/form-section-heading' ),
	Gravatar = require( 'components/gravatar' );

module.exports = React.createClass( {
	displayName: 'HelpHappinessEngineers',

	mixins: [ PureRenderMixin ],

	componentDidMount: function() {
		HappinessEngineersStore.on( 'change', this.refreshHappinessEngineers );
		HappinessEngineersActions.fetch();
	},

	componentWillUnmount: function() {
		HappinessEngineersStore.removeListener( 'change', this.refreshHappinessEngineers );
	},

	getInitialState: function() {
		return {
			happinessEngineers: HappinessEngineersStore.getHappinessEngineers()
		};
	},

	refreshHappinessEngineers: function() {
		this.setState( { happinessEngineers: HappinessEngineersStore.getHappinessEngineers() } );
	},

	render: function() {
		if ( this.state.happinessEngineers.length === 0 ) {
			return null;
		}
		return (
			<div className="help-happiness-engineers">
				<FormSectionHeading>{ this.translate( 'We care about your happiness!' ) }</FormSectionHeading>
				<p className="help-happiness-engineers__description">{ this.translate( 'They don\'t call us Happiness Engineers for nothing. If you need help, we\'re here for you!' ) }</p>
				<div className="help-happiness-engineers__tray">
					{ this.state.happinessEngineers.map( happinessEngineer => <Gravatar key={ happinessEngineer.avatar_URL } user={ { avatar_URL: happinessEngineer.avatar_URL } } size={ 42 } /> ) }
				</div>
			</div>
		);
	}
} );
