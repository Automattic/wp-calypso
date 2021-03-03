/**
 * External dependencies
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

/**
 * Internal dependencies
 */

import WordPressLogo from 'calypso/components/wordpress-logo';
import FlowProgressIndicator from 'calypso/signup/flow-progress-indicator';

/**
 * Style dependencies
 */

import './style.scss';

export default class SignupHeader extends Component {
	static propTypes = {
		flowLength: PropTypes.number,
		positionInFlow: PropTypes.number,
		flowName: PropTypes.string,
		showProgressIndicator: PropTypes.bool,
		shouldShowLoadingScreen: PropTypes.bool,
		isReskinned: PropTypes.bool,
	};

	render() {
		const logoClasses = classnames( {
			'wordpress-logo': true,
			'is-large': this.props.shouldShowLoadingScreen && ! this.props.isReskinned,
		} );

		return (
			<div className="signup-header">
				<WordPressLogo size={ 120 } className={ logoClasses } />

				{ /* Ideally, this is where the back button
			   would live. But thats hard to move, it seems. */ }
				<div className="signup-header__left" />

				{ /* This should show a sign in link instead of
			   the progressIndicator on the account step. */ }
				<div className="signup-header__right">
					{ ! this.props.shouldShowLoadingScreen && this.props.showProgressIndicator && (
						<FlowProgressIndicator
							positionInFlow={ this.props.positionInFlow }
							flowLength={ this.props.flowLength }
							flowName={ this.props.flowName }
						/>
					) }
				</div>
			</div>
		);
	}
}
