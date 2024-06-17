import { Card, Button } from '@automattic/components';
import { localize } from 'i18n-calypso';
import { Fragment, PureComponent } from 'react';
import discoverImage from 'calypso/assets/images/reader/reader-discover.png';

class SubscribingEmailStepContent extends PureComponent {
	render() {
		const { translate } = this.props;
		return (
			<Fragment>
				<div className="reader-landing__button-wrapper">
					<Button
						primary
						type="submit"
						onClick={ this.props.onButtonClick }
						className="reader-landing__button"
					>
						Create new user
					</Button>
				</div>

				<Card className="reader-landing__step-content">
					<section className="reader-landing__features">
						<div className="reader-landing__feature">
							<img
								src={ discoverImage }
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
					</section>
				</Card>
			</Fragment>
		);
	}
}

export default localize( SubscribingEmailStepContent );
