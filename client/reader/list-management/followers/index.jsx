// External dependencies
import React from 'react';
//import debugModule from 'debug';

// Internal dependencies
import Main from 'components/main';
import Navigation from 'reader/list-management/navigation';

//const debug = debugModule( 'calypso:reader:list-management' );

const ListManagementFollowers = React.createClass( {
	propTypes: {
		list: React.PropTypes.shape( {
			owner: React.PropTypes.string.isRequired,
			slug: React.PropTypes.string.isRequired
		} )
	},

	render() {
		return (
			<Main className="list-management-followers">
				<Navigation selected="followers" list={ this.props.list } />
				<h2>{ this.translate( 'List Followers' ) } - { this.props.list.slug }</h2>
			</Main>
			);
	}
} );

export default ListManagementFollowers;
