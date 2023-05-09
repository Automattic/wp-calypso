import { Button, Gridicon } from '@automattic/components';
import classnames from 'classnames';
import { localize } from 'i18n-calypso';
import { isEmpty, flowRight as compose } from 'lodash';
import { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import DateRangePicker from 'calypso/components/date-range';
import { withLocalizedMoment } from 'calypso/components/localized-moment';
import { updateFilter } from 'calypso/state/activity-log/actions';
import { recordTracksEvent, withAnalytics } from 'calypso/state/analytics/actions';

const DATE_FORMAT = 'YYYY-MM-DD HH:mm:ss';

export class DateRangeSelector extends Component {
	state = {
		fromDate: null,
		toDate: null,
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

	handleResetSelection = () => {
		const { siteId, selectDateRange } = this.props;
		this.setState( {
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
