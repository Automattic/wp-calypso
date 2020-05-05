/**
 * External dependencies
 */
import { map } from 'lodash';
import PropTypes from 'prop-types';
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import ReaderSidebarTeamsListItem from './list-item';

const renderItems = ( teams, path ) =>
	map( teams, ( team ) => (
		<ReaderSidebarTeamsListItem key={ team.slug } team={ team } path={ path } />
	) );

export class ReaderSidebarTeams extends Component {
	static propTypes = {
		teams: PropTypes.array,
		path: PropTypes.string.isRequired,
	};

	render() {
		if ( ! this.props.teams ) {
			return null;
		}

		return <div>{ renderItems( this.props.teams, this.props.path ) }</div>;
	}
}

export default ReaderSidebarTeams;
