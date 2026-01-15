import config from '@automattic/calypso-config';
import { Button } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import { useTranslate } from 'i18n-calypso';
import blazeFire from 'calypso/assets/images/blaze/blaze-fire.svg';
import connectIcon from 'calypso/assets/images/blaze/connect-icon.svg';
import wooGraphic from 'calypso/assets/images/blaze/more-followers.jpg';

export default function DisconnectedSite() {
	const translate = useTranslate();
	const connectUrl = config( 'connect_url' );

	return (
		<div className="blaze-disconnected-site">
			{ /* Hero Section */ }
			<div className="blaze-disconnected-site__hero blaze-disconnected-site__section">
				<div className="blaze-disconnected-site__hero-content">
					<div className="blaze-disconnected-site__hero-body">
						<h1 className="blaze-disconnected-site__title">
							{ translate( 'Create ads from your content in a snap with Blaze' ) }
							<span className="blaze-title-logo" aria-hidden="true">
								<img
									className="blaze-title-logo__icon"
									alt=""
									aria-hidden="true"
									src={ blazeFire }
								/>
							</span>
						</h1>
						<p className="blaze-disconnected-site__description">
							{ translate(
								'Blaze is by far the simplest way to start promoting your site, and it can reach over 100 million users across Tumblr and WordPress blogs.'
							) }
						</p>
						<Button className="is-primary" href={ connectUrl } target="_self">
							{ translate( 'Connect now' ) }
						</Button>
					</div>
				</div>
			</div>

			{ /* Features Section */ }
			<div className="blaze-disconnected-site__features blaze-disconnected-site__section">
				<div className="blaze-disconnected-site__features-graphic">
					<img src={ wooGraphic } alt="Blaze Ads" />
				</div>
				<div className="blaze-disconnected-site__features-body">
					<ul className="blaze-disconnected-site__features-list">
						<li>{ translate( 'Get readers to your blog' ) }</li>
						<li>{ translate( 'Find new customers' ) }</li>
						<li>{ translate( 'Get new newsletter subscribers' ) }</li>
						<li>{ translate( 'Reach new fans and followers' ) }</li>
					</ul>
					<p className="blaze-disconnected-site__features-description">
						{ translate(
							"Blaze is built for people who have a business to run or stories to tell, and don't have time for endless settings and options. You can truly get started advertising in just a few minutes."
						) }
					</p>
					<p className="blaze-disconnected-site__features-description">
						{ translate(
							'Create ads using existing content on your site or upload custom images. The AI assistant can help you write the text, and with geographic and interest targeting, you can connect with the audience that matters most to you.'
						) }
					</p>
				</div>
			</div>

			{ /* Three Steps Section */ }
			<div className="blaze-disconnected-site__steps blaze-disconnected-site__section">
				<div className="blaze-disconnected-site__steps-grid">
					<div className="blaze-disconnected-site__step-card">
						<div className="blaze-disconnected-site__step-card-number">1</div>
						<h3 className="blaze-disconnected-site__step-card-title">
							{ translate( 'Choose your best content.' ) }
						</h3>
						<p className="blaze-disconnected-site__step-card-text">
							{ translate(
								'Use what will work best with your audience and transform it into an ad with a click.'
							) }
						</p>
					</div>

					<div className="blaze-disconnected-site__step-card">
						<div className="blaze-disconnected-site__step-card-number">2</div>
						<h3 className="blaze-disconnected-site__step-card-title">
							{ translate( 'Find the right users.' ) }
						</h3>
						<p className="blaze-disconnected-site__step-card-text">
							{ translate( 'We’ll present your content where interested users can discover it.' ) }
						</p>
					</div>

					<div className="blaze-disconnected-site__step-card">
						<div className="blaze-disconnected-site__step-card-number">3</div>
						<h3 className="blaze-disconnected-site__step-card-title">
							{ translate( 'Experience growth' ) }
						</h3>
						<p className="blaze-disconnected-site__step-card-text">
							{ translate(
								' Sense the impact of Blaze for only $5 per day and gain the momentum you need.'
							) }
						</p>
					</div>
				</div>
			</div>

			{ /* Learn More Section */ }
			<div className="blaze-disconnected-site__section">
				<h2 className="blaze-disconnected-site__section-title">
					{ translate( 'Want to learn more about Blaze?' ) }
				</h2>
				<p className="blaze-disconnected-site__section-description">
					{ translate(
						'Explore more about how Blaze can help grow your business by visiting our {{informationLink}}information page{{/informationLink}}. You can also dive into our comprehensive {{supportLink}}support documents{{/supportLink}} for step-by-step guides and tips, or reach out to our {{contactLink}}dedicated support team{{/contactLink}}, always ready to assist with any questions you have.',
						{
							components: {
								informationLink: (
									<a
										href={ localizeUrl( 'https://wordpress.com/advertising/' ) }
										target="_blank"
										rel="noopener noreferrer"
									/>
								),
								supportLink: (
									<a
										href={ localizeUrl( 'https://wordpress.com/support/promote-a-post/' ) }
										target="_blank"
										rel="noopener noreferrer"
									/>
								),
								contactLink: (
									<a
										href={ localizeUrl( 'https://wordpress.com/help/contact/' ) }
										target="_blank"
										rel="noopener noreferrer"
									/>
								),
							},
						}
					) }
				</p>
			</div>

			{ /* Connection Section */ }
			<div className="blaze-disconnected-site__connect blaze-disconnected-site__section">
				<div className="blaze-disconnected-site__connect-content">
					<div className="blaze-disconnected-site__connect-icon">
						<img alt="" aria-hidden="true" src={ connectIcon } />
					</div>
					<div className="blaze-disconnected-site__connect-text">
						<h4 className="blaze-disconnected-site__connect-title">
							{ translate( 'Connect your site' ) }
						</h4>
						<p className="blaze-disconnected-site__connect-description">
							{ translate(
								"You'll need to connect your WordPress.com account to integrate Blaze Ads with your site. Don't have an account? Not to worry - we'll help you create one!"
							) }
						</p>
						<Button className="is-primary" href={ connectUrl } target="_self">
							{ translate( 'Connect now' ) }
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
