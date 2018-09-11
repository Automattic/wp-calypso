/** @format */

/**
 * External dependencies
 */
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';

class ReaderLandingStepContent extends Component {
	render() {
		const { translate } = this.props;
		return (
			<div className="reader-landing__step-content">
				<img
					src="/calypso/images/reader/reader-intro-character.svg"
					alt=""
					className="reader-landing__step-content-illustration"
				/>
				<Button primary={ true } type="submit">
					{ translate( 'Continue' ) }
				</Button>
			</div>
		);
	}
}

export default localize( ReaderLandingStepContent );
