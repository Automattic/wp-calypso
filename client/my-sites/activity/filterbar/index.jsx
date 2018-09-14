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
		const { siteId, selectDateRange } = this.props;
		const { fromDate, toDate } = this.state;
		this.setState( {
			showActivityDates: false,
			toDate: null,
			fromDate: null,
			enteredToDate: null,
		} );
		if ( fromDate && toDate ) {
			selectDateRange(
				siteId,
				moment( fromDate ).format( DATE_FORMAT ),
				moment( toDate ).format( DATE_FORMAT )
			);
			return;
		}

		if ( fromDate ) {
			selectDateRange( siteId, moment( fromDate ).format( DATE_FORMAT ), null );
		}
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
		const { filter } = this.props;
		const day = date.toDate();

		const fromDate = this.getFromDate( filter );
		const toDate = this.getToDate( filter );

		if ( fromDate && toDate && day >= toDate ) {
			this.setState( {
				enteredToDate: day,
				toDate: day,
			} );
			return;
		}
		if ( this.isSelectingFirstDay( fromDate, toDate, day ) ) {
			this.setState( {
				fromDate: day,
				enteredToDate: null,
			} );
			return;
		}

		this.setState( {
			enteredToDate: day,
			toDate: day,
		} );
	};

	handleDayMouseEnter = day => {
		const { filter } = this.props;
		const fromDate = this.getFromDate( filter );
		const toDate = this.getToDate( filter );
		if ( ! this.isSelectingFirstDay( fromDate, toDate, day ) && this.isSelectingDayInPast( day ) ) {
			this.setState( {
				enteredToDate: day,
			} );
		}
		if ( ! this.isSelectingDayInPast( day ) && ! toDate ) {
			this.setState( {
				enteredToDate: fromDate,
			} );
		}
	};

	handleResetSelection = () => {
		const { siteId, selectDateRange } = this.props;
		this.setState( {
			enteredToDate: null,
			fromDate: null,
			toDate: null,
		} );
		selectDateRange( siteId, null, null );
	};

	handleClearSelection = () => {
		this.setState( {
			enteredToDate: null,
			fromDate: null,
			toDate: null,
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

	getFromDate = filter => {
		const { fromDate } = this.state;
		if ( fromDate ) {
			return fromDate;
		}
		return filter && filter.after ? moment( filter.after ).toDate() : null;
	};

	getToDate = filter => {
		const { toDate } = this.state;
		if ( toDate ) {
			return toDate;
		}
		return filter && filter.before ? moment( filter.before ).toDate() : null;
	};

	getEnteredToDate = filter => {
		if ( this.state.enteredToDate ) {
			return this.state.enteredToDate;
		}
		return this.getToDate( filter );
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
					onClearSelection={ this.handleClearSelection }
					from={ this.getFromDate( filter ) }
					to={ this.getToDate( filter ) }
					enteredTo={ this.getEnteredToDate( filter ) }
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
