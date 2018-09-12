/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import Gridicon from 'gridicons';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import { pullAt } from 'lodash';
/**
 * Internal dependencies
 */
import DateRangeSelector from './date-range-selector';
import ActionTypeSelector from './action-type-selector';
import { updateFilter } from 'state/activity-log/actions';

export class Filterbar extends Component {
	state = {
		showActivityTypes: false,
		showActivityDates: false,
	};

	toggleDateRangeSelector = () => {
		this.setState( {
			showActivityDates: ! this.state.showActivityDates,
			showActivityTypes: false,
		} );
	};

	resetActivityTypeSelector = event => {
		const { selectActionType, siteId } = this.props;
		selectActionType( siteId, [] );
		event.preventDefault();
	};

	toggleActivityTypesSelector = () => {
		this.setState( {
			showActivityTypes: ! this.state.showActivityTypes,
			showActivityDates: false,
		} );
	};

	closeActivityTypes = () => {
		this.setState( { showActivityTypes: false } );
	};

	onSelectClick = ( group, event ) => {
		const { filter, selectActionType, siteId } = this.props;
		event.preventDefault();
		const actionTypes =
			filter && filter.group && !! filter.group.length ? filter.group.slice() : [];
		const index = actionTypes.indexOf( group.key );
		if ( index >= 0 ) {
			pullAt( actionTypes, index );
		} else {
			actionTypes.push( group.key );
		}
		selectActionType( siteId, actionTypes );
	};

	render() {
		const { translate, siteId, filter } = this.props;

		return (
			<div className="filterbar card">
				<div className="filterbar__icon-navigation">
					<Gridicon icon="filter" className="filterbar__open-icon" />
				</div>
				<span className="filterbar__label">{ translate( 'Filter by:' ) }</span>
				<DateRangeSelector
					isVisible={ this.state.showActivityDates }
					onButtonClick={ this.toggleDateRangeSelector }
				/>
				<ActionTypeSelector
					siteId={ siteId }
					isVisible={ this.state.showActivityTypes }
					onButtonClick={ this.toggleActivityTypesSelector }
					onClose={ this.closeActivityTypes }
					onSelectClick={ this.onSelectClick }
					selected={ filter && filter.group }
					onResetSelection={ this.resetActivityTypeSelector }
				/>
			</div>
		);
	}
}

export default connect(
	() => ( {} ),
	{
		selectActionType: ( siteId, group ) => updateFilter( siteId, { group: group } ),
	}
)( localize( Filterbar ) );
