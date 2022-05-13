import { ThemeProvider, Global, css } from '@emotion/react';
import styled from '@emotion/styled';
import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import welcomeLogo from 'calypso/assets/images/marketplace/signup-success/welcome-logo.svg';
import WordPressLogo from 'calypso/components/wordpress-logo';
import Item from 'calypso/layout/masterbar/item';
import Masterbar from 'calypso/layout/masterbar/masterbar';
import theme from 'calypso/my-sites/marketplace/theme';
import './style.scss';

const MasterbarStyled = styled( Masterbar )`
	--color-masterbar-background: var( --studio-white );
	--color-masterbar-text: var( --studio-gray-60 );
	border-bottom: 0;
`;

const WordPressLogoStyled = styled( WordPressLogo )`
	max-height: calc( 100% - 47px );
	align-self: center;
	fill: rgb( 54, 54, 54 );
`;

const ItemStyled = styled( Item )`
	cursor: pointer;
	font-size: 14px;
	font-weight: 500;
	padding: 0;
	justify-content: left;

	&:hover {
		background: var( --studio-white );
		text-decoration: underline;
	}

	.gridicon {
		height: 17px;
		fill: var( --studio-black );

		@media ( max-width: 480px ) {
			margin: 0;
		}
	}

	@media ( max-width: 480px ) {
		.masterbar__item-content {
			display: block;
		}
	}
`;

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
			<MasterbarStyled>
				<WordPressLogoStyled />
				<ItemStyled
					icon="chevron-left"
					onClick={ () => ( document.location.href = `${ document.location.origin }` ) }
				>
					{ translate( 'Back to WordPress.com' ) }
				</ItemStyled>
			</MasterbarStyled>
			<div className="signup-success">
				<div className="signup-success__header">
					<img src={ welcomeLogo } alt="signup success logo" />
					<h1 className="signup-success__header-title wp-brand-font">
						{ translate( 'We’ ll be in touch' ) }
					</h1>
					<p>
						{ translate(
							'Thank you for apply to join the WordPress.com marketplace. We’ll be in touch with you very soon to discuss next steps.'
						) }
					</p>
				</div>
				<div className="signup-success__body">
					<div className="signup-success__row">
						<div className="signup-success__row-icon"></div>
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
						<div className="signup-success__row-icon"></div>
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
