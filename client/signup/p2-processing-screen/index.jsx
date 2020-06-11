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
					<img src="/calypso/images/p2/logo-white.png" width="67" height="32" alt="P2 logo" />
				</div>

				<div className="p2-processing-screen__text">
					{ this.props.translate( '{{h2}}Hooray!{{br/}}Your new P2 is{{br/}}almost ready.{{/h2}}', {
						components: {
							// eslint-disable-next-line jsx-a11y/heading-has-content
							h2: <h2 />,
							br: <br />,
						},
					} ) }
				</div>

				<div className="p2-processing-screen__footer">
					<img
						src="/calypso/images/p2/w-logo-white.png"
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
