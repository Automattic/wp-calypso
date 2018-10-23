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
				<Button
					primary={ true }
					type="submit"
					onClick={ onButtonClick }
					className="reader-landing__button"
				>
					{ translate( 'Start using the Reader' ) }
				</Button>

				<section className="reader-landing__features">
					<div className="reader-landing__feature">
						<img src="/calypso/images/signup/reader-landing/animals.jpg" alt="placeholder" />
						<div className="reader-landing__feature-detail">
							<h2 className="reader-landing__feature-heading">
								{ translate( 'Explore the best content on WordPress' ) }
							</h2>
							<p className="reader-landing__feature-description">
								{ translate(
									'Head to the Reader’s Discover section to browse recommended sites, editors’ picks, and site-building resources.'
								) }
							</p>
						</div>
					</div>

					<div className="reader-landing__feature">
						<img src="/calypso/images/signup/reader-landing/animals.jpg" alt="placeholder" />
						<div className="reader-landing__feature-detail">
							<h2 className="reader-landing__feature-heading">
								{ translate( 'Never miss a post from your favorite sites' ) }
							</h2>
							<p className="reader-landing__feature-description">
								{ translate(
									'Whether you’re on your laptop, tablet, or smartphone, set up notifications to get word when a new post appears on a site you follow.'
								) }
							</p>
						</div>
					</div>

					<div className="reader-landing__feature">
						<img src="/calypso/images/signup/reader-landing/animals.jpg" alt="placeholder" />
						<div className="reader-landing__feature-detail">
							<h2 className="reader-landing__feature-heading">
								{ translate( 'Dive into your reading from any mobile device' ) }
							</h2>
							<p className="reader-landing__feature-description">
								{ translate(
									'Access the Reader on the go with the WordPress app, available for iOS or Android devices.'
								) }
							</p>
						</div>
					</div>

					<div className="reader-landing__feature">
						<img src="/calypso/images/signup/reader-landing/animals.jpg" alt="placeholder" />
						<div className="reader-landing__feature-detail">
							<h2 className="reader-landing__feature-heading">
								{ translate( 'Lively conversations made easy' ) }
							</h2>
							<p className="reader-landing__feature-description">
								{ translate(
									'When a post generates an active discussion, you can stay up-to-date on the latest comments — or leave a few yourself.'
								) }
							</p>
						</div>
					</div>
				</section>

				<Button
					primary={ true }
					type="submit"
					onClick={ onButtonClick }
					className="reader-landing__button"
				>
					{ translate( 'Start using the Reader' ) }
				</Button>
			</div>
		);
	}
}

export default localize( ReaderLandingStepContent );
