/**
 * External dependencies
 */
import React, { Fragment, PureComponent } from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import Button from 'components/button';
import { recordTracksEvent } from 'state/analytics/actions';

class ReaderLandingStepContent extends PureComponent {
	handleButtonClick = () => {
		this.props.recordTracksEvent( 'calypso_signup_reader_landing_cta' );
		this.props.onButtonClick();
	};

	render() {
		const { translate } = this.props;
		return (
			<Fragment>
				<div className="reader-landing__button-wrapper">
					<Button
						primary={ true }
						type="submit"
						onClick={ this.handleButtonClick }
						className="reader-landing__button"
					>
						{ translate( 'Start using the Reader' ) }
					</Button>
				</div>

				<Card className="reader-landing__step-content">
					<section className="reader-landing__features">
						<div className="reader-landing__feature">
							<img
								src="/calypso/images/reader/reader-discover.png"
								alt={ translate( 'Screenshot of Reader Discover' ) }
								className="reader-landing__feature-image"
							/>
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

						<div className="reader-landing__feature is-even">
							<img
								src="/calypso/images/reader/reader-notifications.png"
								alt={ translate( 'Screenshot of Reader notifications' ) }
								className="reader-landing__feature-image"
							/>
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
							<img
								src="/calypso/images/reader/reader-mobile.png"
								alt={ translate( 'Person holding a tablet and using Reader' ) }
								className="reader-landing__feature-image"
							/>
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

						<div className="reader-landing__feature is-even">
							<img
								src="/calypso/images/reader/reader-conversations.png"
								alt={ translate( 'Screenshot of Reader Conversations' ) }
								className="reader-landing__feature-image"
							/>
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

					<div className="reader-landing__button-wrapper">
						<Button
							primary={ true }
							type="submit"
							onClick={ this.handleButtonClick }
							className="reader-landing__button"
						>
							{ translate( 'Start using the Reader' ) }
						</Button>
					</div>
				</Card>
			</Fragment>
		);
	}
}
export default connect(
	null,
	{ recordTracksEvent }
)( localize( ReaderLandingStepContent ) );
