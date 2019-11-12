/**
 * External dependencies
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import ExternalLink from './index.jsx';
import { recordTracksEvent } from 'state/analytics/actions';

const ExternalLinkWIthTracking = ( {
	onClick,
	recordTracksEvent: recordEvent,
	tracksEventName,
	tracksEventProps,
	...props
} ) => {
	const clickHandler = () => {
		recordEvent( tracksEventName, tracksEventProps );

		if ( onClick ) {
			onClick();
		}
	};

	return <ExternalLink onClick={ clickHandler } { ...props } />;
};

ExternalLinkWIthTracking.propTypes = {
	onClick: PropTypes.func,
	tracksEventName: PropTypes.string.isRequired,
	tracksEventProps: PropTypes.object,

	// Connected props
	recordTracksEvent: PropTypes.func.isRequired,
};

export default connect(
	null,
	{ recordTracksEvent }
)( ExternalLinkWIthTracking );
