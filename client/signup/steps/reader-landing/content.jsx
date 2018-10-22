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
							<h2>{ translate( 'Explore the best content on WordPress' ) }</h2>
							<p>
								{ translate(
									'Head to the Reader’s Discover section to browse recommended sites, editors’ picks, and site-building resources.'
								) }
							</p>
						</div>
					</div>

					<div className="reader-landing__feature">
						<div className="reader-landing__feature-image-placeholder" />
						<div className="reader-landing__feature-detail">
							<h2>{ translate( 'Never miss a post from your favorite sites' ) }</h2>
							<p>
								{ translate(
									'Whether you’re on your laptop, tablet, or smartphone, set up notifications to get word when a new post appears on a site you follow.'
								) }
							</p>
						</div>
					</div>

					<div className="reader-landing__feature">
						<div className="reader-landing__feature-image-placeholder" />
						<div className="reader-landing__feature-detail">
							<h2>{ translate( 'Dive into your reading from any mobile device' ) }</h2>
							<p>
								{ translate(
									'Access the Reader on the go with the WordPress app, available for iOS or Android devices.'
								) }
							</p>
						</div>
					</div>

					<div className="reader-landing__feature">
						<div className="reader-landing__feature-image-placeholder" />
						<div className="reader-landing__feature-detail">
							<h2>{ translate( 'Lively conversations made easy' ) }</h2>
							<p>
								{ translate(
									'When a post generates an active discussion, you can stay up-to-date on the latest comments — or leave a few yourself.'
								) }
							</p>
						</div>
					</div>
				</section>
			</div>
		);
	}
}

export default localize( ReaderLandingStepContent );
