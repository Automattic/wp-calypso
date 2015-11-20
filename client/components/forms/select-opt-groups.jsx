/**
 * External dependencies
 */
var React = require( 'react' ),
	debug = require( 'debug' )( 'calypso:forms:select-opt-groups' );

var SelectOptGroups = React.createClass( {

	displayName: 'SelectOptGroups',

	componentWillMount: function() {
		debug( 'Mounting SelectOptGroups React component.' );
	},

	render: function() {
		return (
			<select {...this.props} >
			{ this.props.optGroups.map( function( optGroup ) {
				return (
					<optgroup label={ optGroup.label } key={ 'optgroup-' + optGroup.label } >
					{ optGroup.options.map( function( option ) {
						return <option value={ option.value } key={ 'option-' + optGroup.label + option.label } >{ option.label }</option>;
					})}
					</optgroup>
				);
			} ) }
			</select>
		);
	}
});

module.exports = SelectOptGroups;
