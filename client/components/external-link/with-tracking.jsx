/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import ExternalLink from './index';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

class ExternalLinkWithTracking extends Component {
	handleClickEvent() {
		return () => {
			const { onClick, tracksEventName, tracksEventProps } = this.props;

			this.props.recordTracksEvent( tracksEventName, tracksEventProps );

			if ( onClick ) {
				onClick();
			}
		};
	}

	render() {
		const {
			onClick,
			recordTracksEvent: recordEvent,
			tracksEventName,
			tracksEventProps,
			...props
		} = this.props;

		return <ExternalLink onClick={ this.handleClickEvent() } { ...props } />;
	}
}

ExternalLinkWithTracking.propTypes = {
	className: PropTypes.string,
	href: PropTypes.string,
	icon: PropTypes.bool,
	iconClassName: PropTypes.string,
	iconSize: PropTypes.number,
	onClick: PropTypes.func,
	showIconFirst: PropTypes.bool,
	target: PropTypes.string,
	tracksEventName: PropTypes.string.isRequired,
	tracksEventProps: PropTypes.object,

	// Connected props
	recordTracksEvent: PropTypes.func.isRequired,
};

export default connect( null, { recordTracksEvent } )( ExternalLinkWithTracking );
