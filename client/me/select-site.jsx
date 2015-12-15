/**
 * External dependencies
 */
var React = require( 'react' ),
	omit = require( 'lodash/object/omit' );

/**
 * Internal Dependencies
 */
var observe = require( 'lib/mixins/data-observe' );

module.exports = React.createClass( {

	displayName: 'SelectSite',

	mixins: [ observe( 'sites' ) ],

	render: function() {
		var sites = this.props.sites.get();

		if ( this.props.filter ) {
			sites = sites.filter( this.props.filter );
		}

		return (
			<select { ...omit( this.props, 'sites' ) } >
				{
					sites.map( function( site ) {
						return (
							<option value={ site.ID } key={ site.ID }>{ site.title }</option>
						);
					} )
				}
			</select>
		);
	}
} );
