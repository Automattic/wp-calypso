/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { CompactCard, Button } from '@automattic/components';
import { recordTracksEvent } from 'state/analytics/actions';
import Main from 'components/main';

/**
 * Image dependencies
 */
import premiumThemesImage from 'assets/images/illustrations/themes.svg';

/**
 * Style dependencies
 */
import './style.scss';

class UpsellForm extends Component {
	static propTypes = {
		submitForm: PropTypes.func.isRequired,

		// from localize() HoC
		translate: PropTypes.func.isRequired,
	};

	render() {
		return (
			<>
				<Main className="upsell">
					<CompactCard className="upsell__card-header">{ this.header() }</CompactCard>
					<CompactCard className="upsell__card-body">{ this.body() }</CompactCard>
					<CompactCard className="upsell__card-footer">{ this.footer() }</CompactCard>
				</Main>
			</>
		);
	}

	header() {
		return (
			<header className="upsell__small-header">
				<i className="upsell__title">Your domain { this.props.domainName } is awaiting you</i>
			</header>
		);
	}

	body() {
		const { domainName, domainPrice, planPrice } = this.props;

		return (
			<>
				<h2 className="upsell__header">
					Upgrade to a paid plan to use a custom domain <br /> for free
				</h2>

				<div className="upsell__column-pane">
					<div className="upsell__column-content">
						<p>Adding a custom domain is an essential step for your site.</p>
						<p>
							Custom domains are great for SEO, they look more professional, and make it easier to
							share your site on social media, in person, and on business cards.
						</p>

						<p>
							Using custom domains is only available on our paid plans, so you’ll need to upgrade to
							use <strong>{ domainName }</strong> as your primary domain.
						</p>

						<p>
							Good news is that you'll get the first year registration fee for free, with any paid
							plan. Or if you're bringing your domain with us, your mapping or transferring fee.
						</p>

						<p>
							Unlocking access to custom domains is just one of many great reasons to upgrade to a
							paid plan.
						</p>

						<p>
							<h4 className="upsell__section-title">
								Here are three reasons to upgrade to a paid plan:
							</h4>
						</p>

						<ol>
							<li>
								<strong>Expert Support.</strong>{ ' ' }
								<span>
									You’ll gain access to our incredible customer support team, who are available to
									help via email and live chat any time you have a question.
								</span>
							</li>
							<li>
								<strong>No Ads.</strong>{ ' ' }
								<span>
									Free plan sites are ad-supported. Upgrading to a paid plan removes those ads,
									allowing you to build a clean site without ads.
								</span>
							</li>
							<li>
								<strong>More Storage.</strong>{ ' ' }
								<span>
									Our paid plans offer up to four times more storage. With increased storage space
									you’ll be able to upload more images, audio, and documents to your website. On the
									Premium, Business, and eCommerce plans you can upload videos, too.
								</span>
							</li>
						</ol>

						<p>
							And with our popular Premium plan you'll also gain access to some of the most powerful
							features on WordPress.com:
						</p>

						<ul>
							<li>
								<strong>More ways to monetize your site.</strong>{ ' ' }
								<span>
									You can sell stuff on your site without any hassle. Or earn through our special
									advertising program. Or why not both?
								</span>
							</li>
							<li>
								<strong>Advanced tools to become a social media pro.</strong>{ ' ' }
								<span>
									Schedule posts in advance, resurface your older content, or share multiple social
									posts at a time.
								</span>
							</li>
							<li>
								<strong>Customize your premium theme to your exact needs.</strong>{ ' ' }
								<span>
									With advanced design features, you can make your site stand out and never be the
									same as others.
								</span>
							</li>
						</ul>

						<p>
							Our paid plans are the perfect companion for your custom domain. That’s why we’ll
							cover your domain registration fee (or mapping or transferring fee) for the first
							year, saving you { domainPrice }, with any paid plan.
						</p>

						<p>
							Give our paid plans a risk-free test drive with our{ ' ' }
							<u>30-day Money Back Guarantee.</u>
						</p>

						<p>
							<strong>
								Upgrade to any paid plan and use your domain { domainName }, for just as low as{ ' ' }
								{ planPrice }/mo.
							</strong>
						</p>
					</div>
					<div className="upsell__column-doodle">
						<img
							className="upsell__doodle"
							alt="Website expert offering a support session"
							src={ premiumThemesImage }
						/>
					</div>
				</div>
			</>
		);
	}

	footer() {
		const { translate } = this.props;

		return (
			<footer className="upsell__footer">
				<Button
					className="upsell__decline-offer-button"
					onClick={ () => {
						this.props.submitForm( 'decline' );
					} }
				>
					{ translate( "No thanks, I won't use that domain for now" ) }
				</Button>
				<Button
					primary
					className="upsell__accept-offer-button"
					onClick={ () => {
						this.props.submitForm( 'accept' );
					} }
				>
					{ translate( 'Yes, I want to upgrade and use my domain »' ) }
				</Button>
			</footer>
		);
	}
}

export default connect( null, { recordTracksEvent } )( localize( UpsellForm ) );
