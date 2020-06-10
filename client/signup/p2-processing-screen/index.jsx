/**
 * External dependencies
 */
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */

/**
 * Style dependencies
 */
import './style.scss';

export class P2SignupProcessingScreen extends Component {
	render() {
		return (
			<div className="p2-processing-screen">
				<div className="p2-processing-screen__logo">
					<img
						src="https://wpcom.files.wordpress.com/2020/06/p2-logo-light-small.png"
						width="67"
						height="32"
						alt="P2 logo"
					/>
				</div>

				<div className="p2-processing-screen__text">
					<h2>Hooray!</h2>
					<h2>Your new P2 is</h2>
					<h2>almost ready.</h2>
				</div>

				<div className="p2-processing-screen__footer">
					<img
						src="https://wpcom.files.wordpress.com/2020/06/w-logo-light.png"
						className="p2-processing-screen__w-logo"
						alt="WP.com logo"
					/>
					<span className="p2-processing-screen__footer-text">
						{ this.props.translate( 'Powered by WordPress.com' ) }
					</span>
				</div>
			</div>
		);
	}
}

export default localize( P2SignupProcessingScreen );
