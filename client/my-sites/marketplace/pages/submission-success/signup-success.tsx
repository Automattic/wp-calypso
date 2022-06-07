import { ThemeProvider, Global, css } from '@emotion/react';
import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import checkCircleImage from 'calypso/assets/images/marketplace/check-circle-gray.svg';
import settingsImage from 'calypso/assets/images/marketplace/settings.svg';
import shoppingCartImage from 'calypso/assets/images/marketplace/shopping-cart.svg';
import submissionSuccessImage from 'calypso/assets/images/marketplace/submission-success.png';
import theme from 'calypso/my-sites/marketplace/theme';
import MasterbarLogo from '../../components/masterbar-logo';
import './style.scss';

const SignupSuccess = () => {
	const translate = useTranslate();

	return (
		<ThemeProvider theme={ theme }>
			{ /* Using Global to override Global masterbar height */ }
			<Global
				styles={ css`
					body.is-section-marketplace {
						--masterbar-height: 72px;
					}
				` }
			/>
			<MasterbarLogo />
			<div className="signup-success">
				<div className="signup-success__header">
					<img src={ submissionSuccessImage } alt="Submission success" />
					<h1 className="signup-success__header-title wp-brand-font">
						{ translate( 'We’ll be in touch' ) }
					</h1>
					<p>
						{ translate(
							'Thank you for apply to join the WordPress.com marketplace. We’ll be in touch with you very soon to discuss next steps.'
						) }
					</p>
				</div>
				<div className="signup-success__body">
					<div className="signup-success__row">
						<div className="signup-success__row-icon">
							<img src={ checkCircleImage } alt="" />
						</div>
						<div className="signup-success__row-content">
							<h2>{ translate( 'Learn More' ) }</h2>
							<p>{ translate( 'Read more about selling on the WordPress.com marketplace.' ) }</p>
						</div>
						<Button isSecondary href="https://developer.wordpress.com/wordpress-com-marketplace/">
							{ translate( 'Continue' ) }
						</Button>
					</div>
					<hr />
					<div className="signup-success__row">
						<div className="signup-success__row-icon">
							<img src={ shoppingCartImage } alt="" />
						</div>
						<div className="signup-success__row-content">
							<h2>{ translate( 'View the marketplace' ) }</h2>
							<p>{ translate( 'Sign in to see what the marketplace has to offer.' ) }</p>
						</div>
						<Button isSecondary href="/plugins">
							{ translate( 'Continue' ) }
						</Button>
					</div>
					<hr />
					<div className="signup-success__row">
						<div className="signup-success__row-icon">
							<img src={ settingsImage } alt="" />
						</div>
						<div className="signup-success__row-content">
							<h2>{ translate( 'Developer Page' ) }</h2>
							<p>{ translate( 'Learn more about building a WordPress.com integration.' ) }</p>
						</div>
						<Button isSecondary href="https://developer.wordpress.com">
							{ translate( 'Continue' ) }
						</Button>
					</div>
				</div>
			</div>
			<div className="signup-success__footer">
				<p>Contact our teams directly:</p>
				<p className="signup-success__footer-contact">
					<a href="https://wpvip.com/?ref=partners-lp">WordPress.com VIP</a>,{ ' ' }
					<a href="https://jetpack.com/for/hosts/?ref=partners-lp">Jetpack</a>, or{ ' ' }
					<a href="https://woocommerce.com/?ref=partners-lp">WooCommerce</a>
				</p>
			</div>
		</ThemeProvider>
	);
};

export default SignupSuccess;
