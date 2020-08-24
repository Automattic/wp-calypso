/**
 * External dependencies
 */
import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';
import { localize } from 'i18n-calypso';
import Gridicon from 'components/gridicon';
import { isEmpty, flowRight as compose } from 'lodash';
import { DateUtils } from 'react-day-picker';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';
import { updateFilter } from 'state/activity-log/actions';
import { recordTracksEvent, withAnalytics } from 'state/analytics/actions';
import DateRangePicker from 'components/date-range';
import { withLocalizedMoment } from 'components/localized-moment';

const DATE_FORMAT = 'YYYY-MM-DD HH:mm:ss';

export class DateRangeSelector extends Component {
	state = {
		fromDate: null,
		toDate: null,
		enteredToDate: null,
	};

	constructor( props ) {
		super( props );
		this.dateRangeButton = React.createRef();
	}

	handleClose = () => {
		const { moment, siteId, filter, onClose, selectDateRange } = this.props;
		const fromDate = this.getFromDate( filter );
		const toDate = this.getToDate( filter );

		this.setState( {
			toDate: null,
			fromDate: null,
			enteredToDate: null,
		} );

		const formattedFromDate =
			fromDate && moment( fromDate ).startOf( 'day' ).utc().format( DATE_FORMAT );
		const formattedToDate = toDate && moment( toDate ).endOf( 'day' ).utc().format( DATE_FORMAT );
		if ( formattedFromDate && formattedToDate && formattedFromDate !== formattedToDate ) {
			selectDateRange( siteId, formattedFromDate, formattedToDate );
			onClose();
			return;
		}

		if ( formattedFromDate ) {
			selectDateRange( siteId, formattedFromDate, null );
		}

		onClose();
	};

	handleDateRangeCommit = ( startDate, endDate ) => {
		const { moment, selectDateRange } = this.props;
		const formattedStartDate = startDate
			? moment( startDate ).startOf( 'day' ).utc().format( DATE_FORMAT )
			: null;
		const formattedEndDate = endDate
			? moment( endDate ).endOf( 'day' ).utc().format( DATE_FORMAT )
			: null;

		selectDateRange( this.props.siteId, formattedStartDate, formattedEndDate ); // enough?
	};

	isSelectingFirstDay = ( from, to, day ) => {
		const isBeforeFirstDay = from && DateUtils.isDayBefore( day, from );
		const isRangeSelected = from && to;
		return ! from || isBeforeFirstDay || isRangeSelected;
	};

	isSelectingDayInPast = ( day ) => {
		const today = new Date();
		return day.getTime() <= today.getTime();
	};

	handleDayClick = ( date ) => {
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

	handleDayMouseEnter = ( day ) => {
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

	getFormattedFromDate = ( from, to ) => {
		if ( ! from ) {
			return null;
		}

		if ( ! to ) {
			return from.format( 'LL' );
		}

		// Same day Selected
		if ( from.format( 'YYYY-MM-DD' ) === to.format( 'YYYY-MM-DD' ) ) {
			return '';
		}
		// Same Month selected
		if ( from.format( 'YYYY-MM' ) === to.format( 'YYYY-MM' ) ) {
			return '';
		}

		// Same Year Selected
		if ( from.format( 'YYYY' ) === to.format( 'YYYY' ) ) {
			return from.format( 'MMM D' );
		}
		return from.format( 'll' );
	};

	getFormattedToDate = ( from, to ) => {
		if ( ! to ) {
			return null;
		}
		if ( from.format( 'YYYY-MM-DD' ) === to.format( 'YYYY-MM-DD' ) ) {
			return to.format( 'll' );
		}

		if ( from.format( 'YYYY-MM' ) === to.format( 'YYYY-MM' ) ) {
			return `${ from.format( 'MMM D' ) } – ${ to.format( 'D, YYYY' ) }`;
		}

		return to.format( 'll' );
	};

	getFormattedDate = ( from, to ) => {
		const { moment, translate } = this.props;
		const fromMoment = from ? moment( from ) : null;
		const toMoment = to ? moment( to ) : null;
		const fromFormated = this.getFormattedFromDate( fromMoment, toMoment );
		const toFormated = this.getFormattedToDate( fromMoment, toMoment );

		if ( fromFormated && ! toFormated ) {
			return fromFormated;
		}

		if ( ! isEmpty( fromFormated ) && toFormated ) {
			return `${ fromFormated } – ${ toFormated }`;
		}

		if ( toFormated ) {
			return `${ toFormated }`;
		}

		return translate( 'Date Range' );
	};

	getFromDate = () => {
		const { moment, filter } = this.props;
		const { fromDate } = this.state;
		if ( fromDate ) {
			return fromDate;
		}
		if ( filter && filter.after ) {
			return moment( filter.after ).toDate();
		}
		return filter && filter.on ? moment( filter.on ).toDate() : null;
	};

	getToDate = () => {
		const { moment, filter } = this.props;
		const { toDate } = this.state;
		if ( toDate ) {
			return toDate;
		}
		return filter && filter.before ? moment( filter.before ).toDate() : null;
	};

	getEnteredToDate = () => {
		const { filter } = this.props;
		if ( this.state.enteredToDate ) {
			return this.state.enteredToDate;
		}
		return this.getToDate( filter );
	};

	handleButtonClick = () => {
		const { isVisible, onButtonClick } = this.props;
		if ( isVisible ) {
			this.handleClose();
		}
		onButtonClick();
	};

	render() {
		const { customLabel, isVisible } = this.props;
		const from = this.getFromDate();
		const to = this.getToDate();
		const now = new Date();

		const buttonClass = classnames( 'filterbar__selection', {
			'is-selected': from,
			'is-active': isVisible && ! from,
		} );

		return (
			<DateRangePicker
				selectedStartDate={ from }
				selectedEndDate={ to }
				lastSelectableDate={ now }
				onDateCommit={ this.handleDateRangeCommit }
				renderTrigger={ ( props ) => (
					<Fragment>
						<Button
							className={ buttonClass }
							compact
							borderless
							onClick={ props.onTriggerClick }
							ref={ props.buttonRef }
						>
							{ customLabel ? customLabel : this.getFormattedDate( from, to ) }
						</Button>
						{ ( from || to ) && (
							<Button
								className="filterbar__selection-close"
								compact
								borderless
								onClick={ this.handleResetSelection }
							>
								<Gridicon icon="cross-small" />
							</Button>
						) }
					</Fragment>
				) }
			/>
		);
	}
}

const mapDispatchToProps = ( dispatch ) => ( {
	selectDateRange: ( siteId, from, to ) => {
		if ( ! from && ! to ) {
			return dispatch(
				withAnalytics(
					recordTracksEvent( 'calypso_activitylog_filterbar_reset_range' ),
					updateFilter( siteId, { after: from, before: to, on: null, page: 1 } )
				)
			);
		} else if ( to ) {
			const dateTo = new Date( to );
			const dateFrom = new Date( from );
			const dateNow = Date.now();
			const duration = ( dateTo - dateFrom ) / ( 24 * 60 * 60 * 1000 );
			const distance = Math.floor( ( dateNow - dateFrom ) / ( 24 * 60 * 60 * 1000 ) );
			return dispatch(
				withAnalytics(
					recordTracksEvent( 'calypso_activitylog_filterbar_select_range', { duration, distance } ),
					updateFilter( siteId, { after: from, before: to, on: null, page: 1 } )
				)
			);
		}
		const dateFrom = new Date( from );
		const dateNow = Date.now();
		const distance = Math.floor( ( dateNow - dateFrom ) / ( 24 * 60 * 60 * 1000 ) );
		return dispatch(
			withAnalytics(
				recordTracksEvent( 'calypso_activitylog_filterbar_select_range', {
					duration: 1,
					distance,
				} ),
				updateFilter( siteId, { on: from, after: null, before: null, page: 1 } )
			)
		);
	},
} );

export default compose(
	connect( null, mapDispatchToProps ),
	localize,
	withLocalizedMoment
)( DateRangeSelector );
