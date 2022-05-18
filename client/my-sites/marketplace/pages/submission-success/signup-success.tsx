import { Gridicon } from '@automattic/components';
import { ThemeProvider, Global, css } from '@emotion/react';
import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import submissionSuccessImage from 'calypso/assets/images/marketplace/submission-success.png';
import theme from 'calypso/my-sites/marketplace/theme';
import MasterbarStyled from '../../components/masterbar-styled';
import './style.scss';

const SignupSuccess = (): JSX.Element => {
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
			<MasterbarStyled
				onClick={ () => ( document.location.href = `${ document.location.origin }` ) }
				backText={ translate( 'Back to WordPress.com' ) }
			/>
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
							<Gridicon icon="cart" />
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
							<Gridicon icon="cog" />
						</div>
						<div className="signup-success__row-content">
							<h2>{ translate( 'View the marketplace' ) }</h2>
							<p>{ translate( 'Sign in to see what the marketplace has to offer.' ) }</p>
						</div>
						<Button isSecondary href="/plugins">
							{ translate( 'Continue' ) }
						</Button>
					</div>
				</div>
			</div>
		</ThemeProvider>
	);
};

export default SignupSuccess;
