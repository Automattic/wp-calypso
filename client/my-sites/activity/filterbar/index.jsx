/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import Gridicon from 'gridicons';
import { localize, moment } from 'i18n-calypso';
import { connect } from 'react-redux';
import { pullAt } from 'lodash';
import { DateUtils } from 'react-day-picker';
/**
 * Internal dependencies
 */
import DateRangeSelector from './date-range-selector';
import ActionTypeSelector from './action-type-selector';
import { updateFilter } from 'state/activity-log/actions';

const DATE_FORMAT = 'YYYY-MM-DD';
export class Filterbar extends Component {
	state = {
		showActivityTypes: false,
		showActivityDates: false,
		fromDate: null,
		toDate: null,
		enteredToDate: null,
	};

	toggleDateRangeSelector = () => {
		this.setState( {
			showActivityDates: ! this.state.showActivityDates,
			showActivityTypes: false,
		} );
	};

	closeDateRangeSelector = () => {
		this.setState( {
			showActivityDates: false,
		} );
	};

	isSelectingFirstDay = ( from, to, day ) => {
		const isBeforeFirstDay = from && DateUtils.isDayBefore( day, from );
		const isRangeSelected = from && to;
		return ! from || isBeforeFirstDay || isRangeSelected;
	};

	isSelectingDayInPast = day => {
		const today = new Date();
		return day.getTime() <= today.getTime();
	};

	handleDayClick = date => {
		const { siteId, selectDateRange } = this.props;
		const day = date.toDate();
		const { fromDate, toDate } = this.state;
		if ( fromDate && toDate && day >= fromDate && day <= toDate ) {
			this.handleResetSelection();
			return;
		}
		if ( this.isSelectingFirstDay( fromDate, toDate, day ) ) {
			this.setState( {
				fromDate: day,
				toDate: null,
				enteredToDate: null,
			} );
			selectDateRange( siteId, moment( day ).format( DATE_FORMAT ), null );
			return;
		}

		this.setState( {
			toDate: day,
			enteredToDate: day,
		} );
		selectDateRange(
			siteId,
			moment( fromDate ).format( DATE_FORMAT ),
			moment( day ).format( DATE_FORMAT )
		);
	};

	handleDayMouseEnter = day => {
		const { fromDate, toDate } = this.state;
		if ( ! this.isSelectingFirstDay( fromDate, toDate, day ) && this.isSelectingDayInPast( day ) ) {
			this.setState( {
				enteredToDate: day,
			} );
		}
	};

	handleResetSelection = () => {
		this.setState( {
			fromDate: null,
			toDate: null,
			enteredToDate: null,
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

	handleSelectClick = ( group, event ) => {
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
					onClose={ this.closeDateRangeSelector }
					onDayMouseEnter={ this.handleDayMouseEnter }
					onResetSelection={ this.handleResetSelection }
					onDayClick={ this.handleDayClick }
					from={ this.state.fromDate }
					to={ this.state.toDate }
					enteredTo={ this.state.enteredToDate }
				/>
				<ActionTypeSelector
					siteId={ siteId }
					isVisible={ this.state.showActivityTypes }
					onButtonClick={ this.toggleActivityTypesSelector }
					onClose={ this.closeActivityTypes }
					onSelectClick={ this.handleSelectClick }
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
		selectDateRange: ( siteId, from, to ) => updateFilter( siteId, { after: from, before: to } ),
	}
)( localize( Filterbar ) );
