// External dependencies
import React from 'react';
//import debugModule from 'debug';

//const debug = debugModule( 'calypso:reader:list-management' );

const ListManagementSites = React.createClass( {
	propTypes: {
		list: React.PropTypes.shape( {
			owner: React.PropTypes.string.isRequired,
			slug: React.PropTypes.string.isRequired
		} )
	},

	render() {
		if ( ! this.props.list ) {
			return null;
		}

		return (
			<div>
				<h2>{ this.translate( 'List Sites' ) } - { this.props.list.slug }</h2>
			</div>
			);
	}
} );

export default ListManagementSites;
