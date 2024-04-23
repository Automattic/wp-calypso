import { useMobileBreakpoint } from '@automattic/viewport-react';
import { css, Global } from '@emotion/react';
import { Icon } from '@wordpress/components';
import classnames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { ReactNode } from 'react';
import BraveTickIcon from './assets/icons/brave-tick';
import './style.scss';

const globalStyleOverrides = css`
	body.is-section-signup.is-white-signup {
		.layout:not( .dops ):not( .is-wccom-oauth-flow ) {
			// navigation links for step-wrapper are not part of header
			.step-wrapper__navigation .navigation-link.button.is-borderless {
				color: var( --color-text-inverted );
				svg {
					fill: var( --color-text-inverted );
				}
			}
			// slightly more space between navigation links and heading when blue or bordered banner in header
			.signup:not( .is-onboarding-2023-pricing-grid )
				.step-wrapper:not( .is-horizontal-layout )
				.step-wrapper__header {
				margin-top: 70px;
			}
		}
	}
`;

const SignupHeaderOverlayBanner = ( { children }: { children: ReactNode } ) => {
	const classes = classnames( 'signup-header__overlay-banner', {
		'is-dark-background': true,
	} );
	return (
		<>
			<Global styles={ globalStyleOverrides } />
			<div className={ classes }>{ children }</div>
		</>
	);
};

export const SignupHeaderOverlayBannerWithRefundPeriod = () => {
	const isMobile = useMobileBreakpoint();
	const translate = useTranslate();

	return (
		<SignupHeaderOverlayBanner>
			<div
				className={ classnames( 'signup-header__overlay-banner-with-refund-period', {
					'is-mobile': isMobile,
				} ) }
			>
				{ translate( '{{icon/}} {{text}}14-day money-back guarantee on all annual plans{{/text}}', {
					components: {
						icon: (
							<Icon
								icon={
									<BraveTickIcon className="signup-header__overlay-banner-with-refund-period-icon" />
								}
								size={ 30 }
							/>
						),
						text: <span className="signup-header__overlay-banner-with-refund-period-text" />,
					},
					comment:
						'Icon is a green checkmark that precedes the text. The text is about a refund period.',
				} ) }
			</div>
		</SignupHeaderOverlayBanner>
	);
};
