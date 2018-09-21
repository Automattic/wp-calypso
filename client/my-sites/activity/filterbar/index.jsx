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
import FilterbarBanner from 'my-sites/activity/activity-log-banner/filterbar-banner';
import ActionTypeSelector from './action-type-selector';
import { updateFilter } from 'state/activity-log/actions';

/* eslint-disable wpcalypso/jsx-classname-namespace */
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

	closeDateRangeSelector = () => {
		this.setState( { showActivityDates: false } );
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

	render() {
		const { translate, siteId, filter, siteIsOnFreePlan } = this.props;
		return (
			<div>
				<div className="filterbar card">
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
						siteIsOnFreePlan={ siteIsOnFreePlan }
					/>
					<ActionTypeSelector
						filter={ filter }
						siteId={ siteId }
						isVisible={ this.state.showActivityTypes }
						onButtonClick={ this.toggleActivityTypesSelector }
						onClose={ this.closeActivityTypes }
						siteIsOnFreePlan={ siteIsOnFreePlan }
					/>
					{ this.renderCloseButton() }
				</div>
				{ siteIsOnFreePlan && <FilterbarBanner siteId={ siteId } /> }
			</div>
		);
	}
}
/* eslint-enable wpcalypso/jsx-classname-namespace */

export default connect(
	null,
	{
		resetFilters: sideId =>
			updateFilter( sideId, { group: null, after: null, before: null, on: null, page: 1 } ),
	}
)( localize( Filterbar ) );
