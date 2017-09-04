/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import Gridicon from 'gridicons';
import PropTypes from 'prop-types';
import React, { Component } from 'react';

class Event extends Component {
	static propTypes = {
		timestamp: PropTypes.string,
		icon: PropTypes.string,
		heading: PropTypes.string,
	}

	static defaultProps = {
		icon: 'time',
	}

	render() {
		const {
			timestamp,
			icon,
			heading,
			moment,
		} = this.props;

		return (
			<div className="activity-log__event">
				<div className="activity-log__event-meta">
					<span className="activity-log__event-time">{ moment( timestamp ).format( 'LT' ) }</span>
					<Gridicon icon={ icon } size={ 24 } />
				</div>
				<div className="activity-log__event-body">
					{ heading && <div className="activity-log__event-heading">{ heading }</div> }
					<div className="activity-log__event-content">{ this.props.children }</div>
				</div>
			</div>
		);
	}
}

export default localize( Event );
