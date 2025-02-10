import { recordTracksEvent } from '@automattic/calypso-analytics';
import PropTypes from 'prop-types';
import ExternalLink from './index';

/**
 * External link component with tracking capabilities. Inherits all props from ExternalLink component.
 * @param {Object} props - Component props
 * @param {Function} [props.onClick] - Click handler
 * @param {Function} [props.recordTracksEvent] - Custom tracking function
 * @param {string} props.tracksEventName - Name of the tracking event
 * @param {Object} [props.tracksEventProps] - Additional properties for the tracking event
 * @param {string} [props.className] - Additional CSS class names
 * @param {string} [props.href] - URL the link points to
 * @param {boolean} [props.icon] - Whether to show an external link icon
 * @param {number} [props.iconSize] - Size of the icon in pixels
 * @param {string} [props.target] - Link target attribute
 * @param {boolean} [props.showIconFirst] - Whether to show icon before the text
 * @param {string} [props.iconClassName] - Additional CSS class for the icon
 * @param {import('react').ReactNode} [props.iconComponent] - Custom icon component to use instead of default
 * @param {boolean} [props.localizeUrl] - Whether to localize the URL
 * @param {import('react').ReactNode} [props.children] - Link content
 * @returns {import('react').ReactElement} External link component with tracking
 */
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
