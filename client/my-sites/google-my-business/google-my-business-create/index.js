/** @format */

/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import ReactCSSTransitionGroup from 'react-transition-group/CSSTransitionGroup';

/**
 * Internal dependencies
 */
import { recordTracksEvent } from 'state/analytics/actions';

const GoogleMyBusinessCreate = ( { children } ) => (
	<ReactCSSTransitionGroup
		transitionEnterTimeout={ 600 }
		transitionLeaveTimeout={ 200 }
		transitionName="gmb__step"
	>
		{ children }
	</ReactCSSTransitionGroup>
);

export default connect( undefined, { recordTracksEvent } )( localize( GoogleMyBusinessCreate ) );
