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
import Button from 'components/button';
import FormCheckbox from 'components/forms/form-checkbox';
import FormLabel from 'components/forms/form-label';
import Popover from 'components/popover';
import CalendarPopover from 'blocks/calendar-popover';

export class Filterbar extends Component {
	constructor( props ) {
		super( props );
		this.dateRangeButton = React.createRef();
		this.activityTypeButton = React.createRef();
	}

	state = {
		showActivityTypes: false,
		showActivityDates: false,
	};

	toggleActivityDate = () => {
		this.setState( {
			showActivityDates: ! this.state.showActivityDates,
			showActivityTypes: false,
		} );
	};

	toggleActivityTypes = () => {
		this.setState( {
			showActivityTypes: ! this.state.showActivityTypes,
			showActivityDates: false,
		} );
	};

	closeActivityTypes = () => {
		this.setState( { showActivityTypes: false } );
	};

	renderCheckbox = checkbox => {
		return (
			<FormLabel key={ checkbox.key }>
				<FormCheckbox id={ checkbox.key } name={ checkbox.key } />
				{ checkbox.name }
			</FormLabel>
		);
	};

	render() {
		const { translate } = this.props;
		const checkboxes = [
			{ key: 'posts', name: 'Posts and Pages' },
			{ key: 'Comments', name: 'Comments' },
			{ key: 'plugins', name: 'Plugins' },
			{ key: 'themes', name: 'Theme' },
			{ key: 'core', name: 'WordPress' },
			{ key: 'settings', name: 'Posts and Pages' },
			{ key: 'media', name: 'Media' },
			{ key: 'users', name: 'People' },
		];

		return (
			<div className="filterbar card">
				<div className="filterbar__icon-navigation">
					<Gridicon icon="filter" className="filterbar__open-icon" />
				</div>
				<span className="filterbar__label">{ translate( 'Filter by:' ) }</span>
				<Button
					className="filterbar__selection"
					compact
					borderless
					onClick={ this.toggleActivityDate }
					ref={ this.dateRangeButton }
				>
					{ translate( 'Date Range' ) }
				</Button>
				<CalendarPopover
					context={ this.dateRangeButton.current }
					isVisible={ this.state.showActivityDates }
				/>
				<Button
					className="filterbar__selection"
					compact
					borderless
					onClick={ this.toggleActivityTypes }
					ref={ this.activityTypeButton }
				>
					{ translate( 'Activity Type' ) }
				</Button>
				<Popover
					id="filterbar__activity-types"
					isVisible={ this.state.showActivityTypes }
					onClose={ this.closeActivityTypes }
					position={ 'bottom' }
					context={ this.activityTypeButton.current }
				>
					<div className="filterbar__activity-types-selection-wrap">
						<FormLabel>
							<FormCheckbox id="comment_like_notification" name="comment_like_notification" />
							<strong>{ translate( 'All activity type' ) }</strong>
						</FormLabel>
						<div className="filterbar__activity-types-selection-granular">
							{ checkboxes.map( this.renderCheckbox ) }
						</div>
					</div>
				</Popover>
			</div>
		);
	}
}

export default localize( Filterbar );
