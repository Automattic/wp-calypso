/** @format */

/**
 * External dependencies
 */

import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import AsyncLoad from 'components/async-load';
import { getGuidedTourState } from 'state/ui/guided-tours/selectors';

function GuidedTours( props ) {
	const { shouldShow, ...ownProps } = props;

	if ( ! shouldShow ) {
		return null;
	}

	return <AsyncLoad require="layout/guided-tours/component" { ...ownProps } />;
}

export default connect( state => {
	const tourState = getGuidedTourState( state );
	return {
		shouldShow: tourState && tourState.shouldShow,
	};
} )( GuidedTours );
