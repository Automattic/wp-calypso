/**
 * External Dependencies
 */
import React from 'react';
import map from 'lodash/map';

/**
 * Internal Dependencies
 */
import ReaderSidebarTeamsListItem from './list-item';

var config = require( 'config' );

const ReaderSidebarTeams = React.createClass( {

	propTypes: {
		teams: React.PropTypes.array,
		path: React.PropTypes.string.isRequired
	},

	renderItems() {
		const { path } = this.props;
		return map( this.props.teams, function( team ) {
			if ( config.isEnabled( 'reader/' + team.slug ) ) {
				return (
					<ReaderSidebarTeamsListItem key={ team.slug } team={ team } path={ path } />
				);
			}
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
