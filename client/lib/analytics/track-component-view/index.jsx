/**
 * External dependencies
 */

import debugFactory from 'debug';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { bumpStat, recordTracksEvent } from 'calypso/state/analytics/actions';

/**
 * Module variables
 */
const debug = debugFactory( 'calypso:analytics:TrackComponentView' );

class TrackComponentView extends Component {
	static propTypes = {
		eventName: PropTypes.string,
		eventProperties: PropTypes.object,
		recordTracksEvent: PropTypes.func,
		bumpStat: PropTypes.func,
	};

	static defaultProps = {
		recordTracksEvent: () => {},
		bumpStat: () => {},
	};

	UNSAFE_componentWillMount() {
		debug( 'Component will mount.' );
		const { eventName, eventProperties } = this.props;
		if ( eventName ) {
			debug( `Recording Tracks event "${ eventName }".` );
			this.props.recordTracksEvent( eventName, eventProperties );
		}

		const { statGroup, statName } = this.props;
		if ( statGroup ) {
			debug( `Bumping stat "${ statName }".` );
			this.props.bumpStat( statGroup, statName );
		}
	}

	render() {
		return null;
	}
}

export default connect( null, { bumpStat, recordTracksEvent } )( TrackComponentView );
