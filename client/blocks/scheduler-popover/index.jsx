/**
 * External dependencies
 */
import React, { cloneElement, Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { noop, pick } from 'lodash';

/**
 * Internal dependencies
 */
import {
	getSiteGmtOffset,
	getSiteTimezoneValue,
} from 'state/selectors';
import Popover from 'components/popover';
import PostSchedule from 'components/post-schedule';

class SchedulerPopover extends Component {
	static propTypes = {
		children: PropTypes.element,
		gmtOffset: PropTypes.number,
		position: PropTypes.string,
		timezoneValue: PropTypes.string,

		onDateChange: PropTypes.func,
	};

	static defaultProps = {
		position: 'bottom left',
		timezoneValue: '',
		onDateChange: noop,
	};

	state = {
		date: null,
		show: false,
	};

	setDate = date => {
		this.setState( { date } );
		this.props.onDateChange( date );
	};

	closePopover = () => this.setState( { show: false } );

	toggleScheduler = () => this.setState( { show: ! this.state.show } );

	getPopoverReference = scheduler => ( this.schedulerReference = scheduler );

	renderScheduler() {
		const schedulerProperties = Object.assign( {}, pick( this.props, [
			'events',
			'posts',
			'site',
			'onMonthChange',
		] ) );

		return (
			<PostSchedule
				{ ...schedulerProperties }
				selectedDay={ this.state.date }
				gmtOffset={ this.props.gmtOffset }
				timezone={ this.props.timezoneValue }

				onDateChange={ this.setDate }
			/>
		);
	}

	renderChildrenButton() {
		const buttonsProperties = Object.assign( {}, pick( this.props, [
			'onClick',
			'primary',
			'title',
			'tabIndex',
		] ), {
			onClick: this.toggleScheduler,
			ref: this.getPopoverReference
		} );

		return cloneElement(
			this.props.children,
			buttonsProperties,
		);
	}

	render() {
		return (
			<div className="scheduler-popover">
				{ this.renderChildrenButton() }

				<Popover
					context={ this.schedulerReference }
					className="scheduler-popover__popover"
					isVisible={ this.state.show }
					onClose={ this.closePopover }
					position={ this.props.position }
				>
					<span className="scheduler-popover__scheduler">
						{ this.renderScheduler() }
					</span>
				</Popover>
			</div>
		);
	}
}

export default connect(
	( state, { site } ) => ( {
		gmtOffset: getSiteGmtOffset( state, site.ID ),
		timezoneValue: getSiteTimezoneValue( state, site.ID ),
	} )
 )( SchedulerPopover );
