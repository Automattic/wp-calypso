/**
 * External dependencies
 */
import React from 'react';
import debugFactory from 'debug';
const debug = debugFactory( 'calypso:forms:select-opt-groups' );

const SelectOptGroups = React.createClass( {

	displayName: 'SelectOptGroups',

	componentWillMount: function() {
		debug( 'Mounting SelectOptGroups React component.' );
	},

	render: function() {
		const { optGroups, ...props } = this.props;

		return (
			<select { ...props } >
			{ optGroups.map( function( optGroup ) {
				return (
					<optgroup label={ optGroup.label } key={ 'optgroup-' + optGroup.label } >
					{ optGroup.options.map( function( option ) {
						return <option value={ option.value } key={ 'option-' + optGroup.label + option.label } >{ option.label }</option>;
					} ) }
					</optgroup>
				);
			} ) }
			</select>
		);
	}
} );

module.exports = SelectOptGroups;
