/**
 * External dependencies
 */
import React, { PropTypes } from 'react';

/**
 * Internal dependencies
 */
import analytics from 'analytics';

export default React.createClass( {

	displayName: 'TrackComponentView',

	propTypes: {
		eventName: PropTypes.string,
		eventProperties: PropTypes.object
	},

	getDefaultProps() {
		return {
			eventName: null,
			eventProperties: {}
		}
	},

	componentWillMount() {
		if ( this.props.eventName ) {
			analytics.tracks.recordEvent( this.props.eventName, this.props.eventProperties );
		}
	},

	render() {
		return null;
	}

} );

