/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import { omit, isEmpty } from 'lodash';

/**
 * Internal dependencies
 */
import ActivityLogSearchTokens from './activity-log-search-tokens';
import ActivityLogSearchGroups from './activity-log-search-groups';
import Button from 'components/button';
import Gridicon from 'gridicons';

class ActivityLogSearch extends Component {
	static propTypes = {
		translate: PropTypes.func.isRequired,
		filter: PropTypes.object.isRequired,
	};

	state = {
		activeFilter: null,
	};

	hasTokens() {
		return ! isEmpty( omit( this.props.filter, 'page' ) );
	}

	handleFilterClick = event => {
		event.preventDefault();
		this.setState( { activeFilter: event.target.getAttribute( 'data-filter' ) } );
	};

	handleBackClick = event => {
		event.preventDefault();
		this.setState( { activeFilter: null } );
	};

	activeFilterHeaderText() {
		const { translate } = this.props;
		switch ( this.state.activeFilter ) {
			case 'group':
				return translate( 'Search by Activity Group' );
			case 'time':
				return translate( 'Search by time' );
		}
	}

	render() {
		const { translate, filter, siteId } = this.props;

		return (
			<section className="activity-log-search">
				{ this.hasTokens() && <ActivityLogSearchTokens filter={ filter } siteId={ siteId } /> }
				<div className="activity-log-search__filters">
					{ this.state.activeFilter ? (
						<div className="activity-log-search__filters-header">
							<Button
								className="activity-log-search__filters-back"
								onClick={ this.handleBackClick }
								borderless={ true }
								compact={ true }
							>
								<Gridicon icon="arrow-left" />
								<span>{ translate( 'Go Back' ) }</span>
							</Button>
							<div className="activity-log-search__filters-header-text">
								{ this.activeFilterHeaderText() }
							</div>
						</div>
					) : (
						<div className="activity-log-search__filters-header">
							<div className="activity-log-search__filters-header-text">
								{ translate( 'Search by' ) }
							</div>
						</div>
					) }

					{ 'group' === this.state.activeFilter && <ActivityLogSearchGroups siteId={ siteId } /> }

					{ ! this.state.activeFilter && (
						<div className="activity-log-search__filters-categories">
							<button
								className="activity-log-search__filter"
								onClick={ this.handleFilterClick }
								data-filter="group"
							>
								<Gridicon icon="types" className="activity-log-search__filter-icon" size={ 18 } />
								<span>{ translate( 'Activity Group' ) }</span>
							</button>
							<button
								className="activity-log-search__filter"
								onClick={ this.handleFilterClick }
								data-filter="time"
							>
								<Gridicon icon="time" className="activity-log-search__filter-icon" size={ 18 } />
								<span>{ translate( 'Time' ) }</span>
							</button>
						</div>
					) }
				</div>
			</section>
		);
	}
}

export default localize( ActivityLogSearch );
