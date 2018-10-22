/** @format */

/**
 * External dependencies
 */
import React, { PureComponent } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';

class ReaderLandingStepContent extends PureComponent {
	render() {
		const { translate, onButtonClick } = this.props;
		return (
			<div className="reader-landing__step-content">
				<Button primary={ true } type="submit" onClick={ onButtonClick }>
					{ translate( 'Start using the Reader' ) }
				</Button>

				<section className="reader-landing__features">
					<div className="reader-landing__feature">
						<div className="reader-landing__feature-image-placeholder" />
						<div className="reader-landing__feature-detail">
							<h2>Discover new content</h2>
							<p>blah</p>
						</div>
					</div>

					<div className="reader-landing__feature">
						<div className="reader-landing__feature-image-placeholder" />
						<div className="reader-landing__feature-detail">
							<h2>Discover new content</h2>
							<p>blah</p>
						</div>
					</div>

					<div className="reader-landing__feature">
						<div className="reader-landing__feature-image-placeholder" />
						<div className="reader-landing__feature-detail">
							<h2>Discover new content</h2>
							<p>blah</p>
						</div>
					</div>

					<div className="reader-landing__feature">
						<div className="reader-landing__feature-image-placeholder" />
						<div className="reader-landing__feature-detail">
							<h2>Discover new content</h2>
							<p>blah</p>
						</div>
					</div>
				</section>
			</div>
		);
	}
}

export default localize( ReaderLandingStepContent );
