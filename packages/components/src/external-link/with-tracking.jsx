import { recordTracksEvent } from '@automattic/calypso-analytics';
import PropTypes from 'prop-types';
import { Component } from 'react';
import ExternalLink from './index';

class ExternalLinkWithTracking extends Component {
	handleClickEvent() {
		return () => {
			const { onClick, tracksEventName, tracksEventProps } = this.props;
			const trackEvent = this.props.recordTracksEvent || recordTracksEvent;

			trackEvent( tracksEventName, tracksEventProps );

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
	rel: PropTypes.string,
	children: PropTypes.node,
	recordTracksEvent: PropTypes.func,
};

export default ExternalLinkWithTracking;
