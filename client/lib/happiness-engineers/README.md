Happiness engineers
===================

This module is a flux approach for storing and retrieving happiness engineers user objects.
It is intended to be used to display a list happiness engineers gravatars in Calypso help page.

Example usage
=============
```
/**
 * External dependencies
 */
var React = require( 'react' ),
	map = require( 'lodash/collection/map' );

/**
 * Internal dependencies
 */
var HappinessEngineersStore = require( 'lib/happiness-engineers/store' ),
	HappinessEngineersActions = require( 'lib/happiness-engineers/actions' )
	Main = require( 'components/main' ),
	Gravatar = require( 'components/gravatar' );

module.exports = React.createClass( {

	displayName: 'yourComponent',

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

	displayHappinessEngineers: function() {
		return (
			<div>
				{ map( this.state.happinessEngineers, function( happinessEngineer ) {
					return (
						<Gravatar key={ happinessEngineer.avatar_URL } user={ { avatar_URL: happinessEngineer.avatar_URL } } size={ 42 } />
					);
				}, this ) }
			</div>
		);
	},

	render: function() {
		if ( this.state.happinessEngineers.length > 0 ) {
			return (
				<Main>
					{ this.displayHappinessEngineers() }
				</Main>
			);
		}

		return null;
	}
} );
```

Testing
=======
Run the following command from calypso root
```cd client/lib/happiness-engineers && make test```
