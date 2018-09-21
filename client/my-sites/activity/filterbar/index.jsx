/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import Gridicon from 'gridicons';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
/**
 * Internal dependencies
 */
import Button from 'components/button';
import DateRangeSelector from './date-range-selector';
import ActionTypeSelector from './action-type-selector';
import { updateFilter } from 'state/activity-log/actions';
import { recordTracksEvent, withAnalytics } from 'state/analytics/actions';
import { isWithinBreakpoint } from 'lib/viewport';

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
		this.scrollIntoView();
	};

	closeDateRangeSelector = () => {
		this.setState( { showActivityDates: false } );
	};

	toggleActivityTypesSelector = () => {
		this.setState( {
			showActivityTypes: ! this.state.showActivityTypes,
			showActivityDates: false,
		} );
		this.scrollIntoView();
	};

	closeActivityTypes = () => {
		this.setState( { showActivityTypes: false } );
	};

	handleRemoveFilters = () => {
		const { siteId, resetFilters } = this.props;
		resetFilters( siteId );
	};

	renderCloseButton = () => {
		const { filter } = this.props;
		if ( filter && ( filter.group || filter.before || filter.after ) ) {
			return (
				<Button onClick={ this.handleRemoveFilters } borderless className="filterbar__icon-reset">
					<Gridicon icon="cross" />
				</Button>
			);
		}
	};

	scrollIntoView = () => {
		if ( isWithinBreakpoint( '>660px' ) ) {
			//  scroll into view only happends on mobile
			return true;
		}
		const filterbar = document.getElementById( 'filterbar' );
		if ( filterbar ) {
			filterbar.scrollIntoView( { behavior: 'smooth', block: 'start', inline: 'nearest' } );
			window.scrollBy( 0, -50 );
		}
	};

	render() {
		const { translate, siteId, filter, isLoading, isVisible } = this.props;

		if ( isLoading ) {
			return <div className="filterbar is-loading" />;
		}

		if ( ! isVisible ) {
			return null;
		}

		return (
			<div className="filterbar" id="filterbar">
				<div className="filterbar__wrap card">
					<div className="filterbar__icon-navigation">
						<Gridicon icon="filter" className="filterbar__open-icon" />
					</div>
					<span className="filterbar__label">{ translate( 'Filter by:' ) }</span>
					<DateRangeSelector
						isVisible={ this.state.showActivityDates }
						onButtonClick={ this.toggleDateRangeSelector }
						onClose={ this.closeDateRangeSelector }
						filter={ filter }
						siteId={ siteId }
					/>
					<ActionTypeSelector
						filter={ filter }
						siteId={ siteId }
						isVisible={ this.state.showActivityTypes }
						onButtonClick={ this.toggleActivityTypesSelector }
						onClose={ this.closeActivityTypes }
					/>
					{ this.renderCloseButton() }
				</div>
				<div className="filterbar__mobile-wrap" />
			</div>
		);
	}
}

const mapDispatchToProps = dispatch => ( {
	resetFilters: sideId =>
		dispatch(
			withAnalytics(
				recordTracksEvent( 'calypso_activitylog_filterbar_reset' ),
				updateFilter( sideId, { group: null, after: null, before: null, on: null, page: 1 } )
			)
		),
} );

export default connect(
	null,
	mapDispatchToProps
)( localize( Filterbar ) );
