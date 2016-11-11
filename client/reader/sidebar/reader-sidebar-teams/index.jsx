/**
 * External Dependencies
 */
import React, { Component } from 'react';
import map from 'lodash/map';

/**
 * Internal Dependencies
 */
import ReaderSidebarTeamsListItem from './list-item';

export class ReaderSidebarTeams extends Component {

	constructor() {
		super();
		this.renderItems = this.renderItems.bind( this );
	}

	renderItems() {
		const { path } = this.props;
		return map( this.props.teams, function( team ) {
			return (
				<ReaderSidebarTeamsListItem key={ team.slug } team={ team } path={ path } />
			);
		} );
	}

	render() {
		if ( ! this.props.teams ) {
			return null;
		}

		return (
			<div>{ this.renderItems() }</div>
		);
	}
}

ReaderSidebarTeamsListItem.propTypes = {
	teams: React.PropTypes.array,
	path: React.PropTypes.string.isRequired,
};

export default ReaderSidebarTeams;
