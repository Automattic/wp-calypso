/**
 * External dependencies
 */
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import StepWrapper from 'signup/step-wrapper';

/**
 * Style dependencies
 */
import './style.scss';

class P2StepWrapper extends Component {
	render() {
		return (
			<div className="p2-step-wrapper">
				<div className="p2-step-wrapper__header">
					<div className="p2-step-wrapper__header-logo">
						<img
							src="https://wpcom.files.wordpress.com/2020/05/logo.png"
							width="67"
							height="32"
							alt="P2 logo"
						/>
					</div>
					{ this.props.headerText && (
						<div className="p2-step-wrapper__header-text">{ this.props.headerText }</div>
					) }
				</div>
				<StepWrapper
					hideFormattedHeader
					flowName={ this.props.flowName }
					stepName={ this.props.stepName }
					positionInFlow={ this.props.positionInFlow }
					fallbackHeaderText={ this.props.fallbackHeaderText }
					stepContent={ this.props.children }
				/>
				<div className="p2-step-wrapper__footer">
					<img
						src="https://wpcom.files.wordpress.com/2020/05/w-logo-1.png"
						className="p2-step-wrapper__w-logo"
						alt="WP.com logo"
					/>
					<span className="p2-step-wrapper__footer-text">
						{ this.props.translate( 'Powered by WordPress.com' ) }
					</span>
				</div>
			</div>
		);
	}
}

export default localize( P2StepWrapper );
