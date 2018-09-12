/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import Gridicon from 'gridicons';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import DateRangeSelector from './date-range-selector';
import ActionTypeSelector from './action-type-selector';

export class Filterbar extends Component {
	state = {
		showActivityTypes: false,
		showActivityDates: false,
		selectedCheckboxes: {},
	};

	toggleDateRangeSelector = () => {
		this.setState( {
			showActivityDates: ! this.state.showActivityDates,
			showActivityTypes: false,
		} );
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

	onSelectClick = ( checkbox, event ) => {
		const selectedCheckboxes = this.state.selectedCheckboxes;
		selectedCheckboxes[ checkbox.key ] = ! selectedCheckboxes[ checkbox.key ];
		// create a new object so react rerender the ActionTypeSelector component
		this.setState( { selectedCheckboxes: Object.assign( {}, selectedCheckboxes ) } );
		event.preventDefault();
	};

	render() {
		const { translate, siteId } = this.props;
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
					selected={ this.state.selectedCheckboxes }
				/>
			</div>
		);
	}
}
export default localize( Filterbar );
