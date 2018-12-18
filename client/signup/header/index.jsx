/** @format */

/**
 * External dependencies
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

/**
 * Internal dependencies
 */

import WordPressLogo from 'components/wordpress-logo';
import FlowProgressIndicator from 'signup/flow-progress-indicator';

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
	};

	constructor( props ) {
		super( props );
		this.state = { showMockMasterBar: true };
	}

	// We want to show the mock masterbar to transition into the signup steps
	// and then animate it out, and remove it
	shouldShowMockMasterBar() {
		if ( ! this.state.showMockMasterBar ) {
			return false;
		}
		// we want to remove it altogether after the animation is done
		setTimeout( () => {
			this.setState( { showMockMasterBar: false } );
		}, 500 );
		return true;
	}

	render() {
		const logoClasses = classnames( {
			'wordpress-logo': true,
			'is-large': this.props.shouldShowLoadingScreen,
		} );

		return (
			<div className="header">
				{ this.shouldShowMockMasterBar() && <div className="header__masterbar-mock masterbar" /> }
				<WordPressLogo size={ 120 } className={ logoClasses } />

				{ /* Ideally, this is where the back button
			   would live. But thats hard to move, it seems. */ }
				<div className="header__left" />

				{ /* This should show a sign in link instead of
			   the progressIndicator on the account step. */ }
				<div className="header__right">
					{ ! this.props.shouldShowLoadingScreen &&
						this.props.showProgressIndicator && (
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
