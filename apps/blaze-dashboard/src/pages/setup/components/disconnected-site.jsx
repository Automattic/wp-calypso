import config from '@automattic/calypso-config';
import { Button } from '@automattic/components';
import { formatCurrency } from '@automattic/number-formatters';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import blazeFire from 'calypso/assets/images/blaze/blaze-fire.svg';
import getStarted from 'calypso/assets/images/blaze/get-started.png';
import wooGraphic from 'calypso/assets/images/blaze/more-followers.jpg';
import ConnectIcon from './connect-icon';
import FaqAccordion from './faq-accordion';

export default function DisconnectedSite() {
	const translate = useTranslate();
	const connectUrl = config( 'connect_url' );
	const isWooStore = config.isEnabled( 'is_running_in_woo_site' );
	const minDailyBudget = formatCurrency( 5, 'USD' );

	return (
		<div className={ clsx( 'blaze-disconnected-site', { 'is-woo': isWooStore } ) }>
			{ /* Hero Section */ }
			<div className="blaze-disconnected-site__hero blaze-disconnected-site__section">
				<div className="blaze-disconnected-site__hero-content">
					<div className="blaze-disconnected-site__hero-body">
						<h1 className="blaze-disconnected-site__title">
							{ isWooStore
								? translate( 'Create ads from your products in a snap with Blaze' )
								: translate( 'Create ads from your content in a snap with Blaze' ) }
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
								'The simplest way to promote your site to over 100 million users across WordPress and Tumblr.'
							) }
							<br />
							{ isWooStore
								? translate( 'Turn your products into ads in just a few clicks.' )
								: translate( 'Turn your content into ads in just a few clicks.' ) }
						</p>
						<Button className="is-primary" href={ connectUrl } target="_self">
							<ConnectIcon />
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
						{ isWooStore ? (
							<>
								<li>{ translate( 'Drive traffic to your products' ) }</li>
								<li>{ translate( 'Boost sales and revenue' ) }</li>
								<li>{ translate( 'Reach a wider audience' ) }</li>
								<li>{ translate( 'Grow your customer base' ) }</li>
							</>
						) : (
							<>
								<li>{ translate( 'Grow your audience and subscribers' ) }</li>
								<li>{ translate( 'Tap into a network of 100 million users' ) }</li>
								<li>{ translate( 'Turn content into compelling ads' ) }</li>
								<li>
									{ translate( 'Start with just %(minDailyBudget)s per day', {
										args: { minDailyBudget },
									} ) }
								</li>
							</>
						) }
					</ul>
					<p className="blaze-disconnected-site__features-description">
						{ isWooStore
							? translate(
									'Blaze is built for merchants who have a business to run and no time for endless settings. You can start driving traffic in just a few minutes.'
							  )
							: translate(
									'Blaze is built for creators who have stories to tell but no time for complex ad platforms. You can launch a campaign in just a few minutes.'
							  ) }
					</p>
					<p className="blaze-disconnected-site__features-description">
						{ isWooStore
							? translate(
									'Create ads directly from your product catalog or upload custom images to showcase your brand. The AI assistant helps draft compelling copy, while geographic and interest targeting connects you with the customers most likely to buy.'
							  )
							: translate(
									'Instantly turn your existing posts into ads, or upload custom images. The AI assistant helps refine your message, while interest targeting ensures you connect with the people who matter most.'
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
							{ isWooStore
								? translate( 'Promote your products.' )
								: translate( 'Choose your best content.' ) }
						</h3>
						<p className="blaze-disconnected-site__step-card-text">
							{ isWooStore
								? translate(
										'Select items directly from your inventory and transform them into ads with a single click.'
								  )
								: translate(
										'Transform your top-performing posts and pages into ads with a single click.'
								  ) }
						</p>
					</div>

					<div className="blaze-disconnected-site__step-card">
						<div className="blaze-disconnected-site__step-card-number">2</div>
						<h3 className="blaze-disconnected-site__step-card-title">
							{ isWooStore
								? translate( 'Find the right customers.' )
								: translate( 'Find your ideal crowd.' ) }
						</h3>
						<p className="blaze-disconnected-site__step-card-text">
							{ isWooStore
								? translate(
										'We present your products to interested shoppers right where they are browsing.'
								  )
								: translate(
										'We display your stories where interested users are already looking to discover new content.'
								  ) }
						</p>
					</div>

					<div className="blaze-disconnected-site__step-card">
						<div className="blaze-disconnected-site__step-card-number">3</div>
						<h3 className="blaze-disconnected-site__step-card-title">
							{ isWooStore ? translate( 'Drive results.' ) : translate( 'Experience growth.' ) }
						</h3>
						<p className="blaze-disconnected-site__step-card-text">
							{ isWooStore
								? translate(
										'See the impact on your store traffic for just %(minDailyBudget)s per day and gain the momentum you need.',
										{
											args: { minDailyBudget },
										}
								  )
								: translate(
										'Start building momentum and traffic for just %(minDailyBudget)s per day.',
										{
											args: { minDailyBudget },
										}
								  ) }
						</p>
					</div>
				</div>
			</div>

			{ /* FAQ Section */ }
			<div className="blaze-disconnected-site__faq blaze-disconnected-site__section">
				<h2 className="blaze-disconnected-site__section-title">
					{ translate( 'Frequently asked questions' ) }
				</h2>
				<FaqAccordion
					question={ translate( 'How does Blaze differ from organic traffic growth?' ) }
					answer={ translate(
						'Organic growth is essential but often slow. Blaze amplifies your reach immediately. Instead of waiting for users to find you via search, it proactively places your content or products in the feeds of users who are already reading about related topics. It is designed to supplement your SEO efforts with immediate visibility.'
					) }
				/>
				<FaqAccordion
					question={ translate( 'Do I need design skills to create ad creatives?' ) }
					answer={ translate(
						'No. The tool automates the creative process by pulling the featured image and title from your existing post or product page. You have full control to edit the text or crop the image within the dashboard, but you do not need external design software to launch a professional-looking campaign.'
					) }
				/>
				<FaqAccordion
					question={ translate( 'What can I expect from a minimum budget?' ) }
					answer={ translate(
						'Campaigns start at %(minDailyBudget)s per day. While higher budgets reach more people, the minimum spend is sufficient to generate thousands of impressions. This allows you to cost-effectively test different products or headlines to see what converts before committing to a larger budget.',
						{
							args: { minDailyBudget },
						}
					) }
				/>
				{ isWooStore && (
					<FaqAccordion
						question={ translate( 'How does this integrate with WooCommerce?' ) }
						answer={ translate(
							'Blaze is fully compatible with WooCommerce. You\'ll see all of your inventory, allowing you to select specific products to promote. You can target audiences based on interests (e.g., "Fashion," "Tech," "DIY"), sending high-intent traffic directly to your product.'
						) }
					/>
				) }
				<FaqAccordion
					question={ translate( 'Where exactly do the ads appear?' ) }
					answer={ translate(
						'Your ads run as "Sponsored Content" across the WordPress.com and Tumblr networks, reaching a potential audience of over 100 million users. The ads appear natively within user feeds or website content that users are actively consuming.'
					) }
				/>
				<FaqAccordion
					question={ translate( 'Why is a WordPress.com connection required?' ) }
					answer={ translate(
						'The connection provides the necessary infrastructure for ad delivery and billing. It authenticates your site to broadcast content across the network and ensures secure payment processing. If you do not have an account, the setup process will guide you through creating one quickly.'
					) }
				/>
			</div>

			{ /* Connection Section */ }
			<div className="blaze-disconnected-site__connect blaze-disconnected-site__section">
				<div className="blaze-disconnected-site__connect-content">
					<div className="blaze-disconnected-site__connect-graphic">
						<img src={ getStarted } alt="" />
					</div>
					<div className="blaze-disconnected-site__connect-body">
						<h4 className="blaze-disconnected-site__connect-title">
							{ translate( 'Ready to get started?' ) }
							<span className="blaze-title-logo" aria-hidden="true">
								<img
									className="blaze-title-logo__icon"
									alt=""
									aria-hidden="true"
									src={ blazeFire }
								/>
							</span>
						</h4>
						<p className="blaze-disconnected-site__connect-description">
							{ translate(
								'Connect your site now to unlock the dashboard and start your first campaign.'
							) }
						</p>
						<Button className="is-primary" href={ connectUrl } target="_self">
							<ConnectIcon />
							{ translate( 'Connect now' ) }
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
