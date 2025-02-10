import { recordTracksEvent } from '@automattic/calypso-analytics';
import PropTypes from 'prop-types';
import ExternalLink from './index';

function ExternalLinkWithTracking( {
	onClick,
	recordTracksEvent: recordEvent,
	tracksEventName,
	tracksEventProps,
	...props
} ) {
	const handleClickEvent = () => {
		const trackEvent = recordEvent || recordTracksEvent;
		trackEvent( tracksEventName, tracksEventProps );

		if ( onClick ) {
			onClick();
		}
	};

	return <ExternalLink onClick={ handleClickEvent } { ...props } />;
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
