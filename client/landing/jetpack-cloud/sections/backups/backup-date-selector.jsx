/**
 * External dependencies
 */
import React, { Component } from 'react';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import DateRangeSelector from 'my-sites/activity/filterbar/date-range-selector';

import './backup-date-selector.scss';

class BackupDateSelector extends Component {

	state = {
		currentDateSetting: false,
	};

	previousDate = () => {
		const currentDate = new Date( this.state.currentDateSetting );
		const newDate = new Date();
		newDate.setDate( currentDate.getDate() - 1 );
		this.setDate( newDate.getTime() );
	};

	nextDate = () => {
		const currentDate = new Date( this.state.currentDateSetting );
		const newDate = new Date();
		newDate.setDate( currentDate.getDate() + 1 );
		this.setDate( newDate.getTime() );
	};

	setDate = newDate => {
		this.setState( { currentDateSetting: newDate } );
		this.props.onDateChange( this.state.currentDateSetting );
	};

	componentWillMount() {
		this.setState( {
			currentDateSetting: Date.now(),
		} );
	}

	componentDidMount() {
		this.props.onDateChange( this.state.currentDateSetting );
	}

	render() {
		const displayDate = new Date( this.state.currentDateSetting ).toISOString().split( 'T' )[0];

		return (
			<div className="jetpack-cloud__backup-date-selector">
				<Gridicon className="chevron" icon="chevron-left" onClick={ this.previousDate } />
				<div className="chevron">{ displayDate }</div>
				<Gridicon className="chevron" icon="chevron-right" onClick={ this.nextDate } />
				<DateRangeSelector
					isVisible={ true }
					onButtonClick={ null }
					onClose={ null }
					siteId={ this.props.siteId }
				/>
			</div>
		);
	}
}

export default BackupDateSelector;