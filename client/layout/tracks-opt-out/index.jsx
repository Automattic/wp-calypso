/** @format */

/**
 * External dependencies
 */
import debug from 'debug';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { setTracksOptOut } from 'state/analytics/actions';

/**
 * Module variables
 */
const tracksDebug = debug( 'calypso:analytics:tracks' );

class TracksOptOut extends React.Component {
	static propTypes = {
		userSettings: PropTypes.object.isRequired,
		setTracksOptOut: PropTypes.func.isRequired,
	};

	componentDidMount() {
		this.props.userSettings.on( 'change', this.syncTracksOptOut );
	}

	componentWillUnmount() {
		this.props.userSettings.off( 'change', this.syncTracksOptOut );
	}

	componentWillReceiveProps( nextProps ) {
		if ( this.props.userSettings !== nextProps.userSettings ) {
			this.props.userSettings.off( 'change', this.syncTracksOptOut );
			nextProps.userSettings.on( 'change', this.syncTracksOptOut );
		}
	}

	syncTracksOptOut = () => {
		const isOptedOut = this.props.userSettings.getSetting( 'tracks_opt_out' );
		tracksDebug( `Syncing tracks opt out status to \`${ isOptedOut }\`` );
		this.props.setTracksOptOut( isOptedOut );
	};

	render() {
		return null;
	}
}

export default connect( null, { setTracksOptOut } )( TracksOptOut );
