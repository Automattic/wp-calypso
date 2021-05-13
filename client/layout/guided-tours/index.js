/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import AsyncLoad from 'calypso/components/async-load';
import { getGuidedTourState } from 'calypso/state/guided-tours/selectors';

function GuidedTours( { shouldShow } ) {
	if ( ! shouldShow ) {
		return null;
	}

	return <AsyncLoad require="calypso/layout/guided-tours/component" />;
}

export default connect( ( state ) => {
	const tourState = getGuidedTourState( state );
	return {
		shouldShow: tourState && tourState.shouldShow,
	};
} )( GuidedTours );
