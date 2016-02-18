/**
 * External Dependencies
 */
import React from 'react';
import map from 'lodash/map';

/**
 * Internal Dependencies
 */
import ReaderSidebarTeamsListItem from './list-item';

const ReaderSidebarTeams = React.createClass( {

	propTypes: {
		teams: React.PropTypes.array,
		path: React.PropTypes.string.isRequired
	},

	renderItems() {
		const { path } = this.props;
		return map( this.props.teams, function( team ) {
			return (
				<ReaderSidebarTeamsListItem key={ team.slug } team={ team } path={ path } />
			);
		} );
	},

	render: function() {
		if ( ! this.props.teams ) {
			return null;
		}

		return (
			<div>{ this.renderItems() }</div>
		);
	}
} );

export default ReaderSidebarTeams;
