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
			.step-wrapper__navigation .navigation-link.button.is-borderless {
				color: var( --color-text-inverted );
				svg {
					fill: var( --color-text-inverted );
				}
			}
			.signup-header .wordpress-logo {
				fill: var( --color-text-inverted );
			}

			.signup:not( .is-onboarding-2023-pricing-grid )
				.step-wrapper:not( .is-horizontal-layout )
				.step-wrapper__header {
				margin-top: 70px;
			}
		}
	}
`;

const SignupHeaderBanner = ( { children }: { children: ReactNode } ) => {
	return (
		<>
			<Global styles={ globalStyleOverrides } />
			<div className="signup-header__overflow-banner">{ children }</div>
		</>
	);
};

export const SignupHeaderBannerWithRefundPeriod = () => {
	const isMobile = useMobileBreakpoint();
	const translate = useTranslate();

	return (
		<SignupHeaderBanner>
			<div
				className={ classnames( 'signup-header__overflow-banner-with-refund-period', {
					'is-mobile': isMobile,
				} ) }
			>
				{ translate( '{{icon/}} {{text}}14-day money-back guarantee on all annual plans{{/text}}', {
					components: {
						icon: (
							<Icon
								icon={
									<BraveTickIcon className="signup-header__overflow-banner-with-refund-period-icon" />
								}
								size={ 30 }
							/>
						),
						text: <span className="signup-header__overflow-banner-with-refund-period-text" />,
					},
				} ) }
			</div>
		</SignupHeaderBanner>
	);
};

export default SignupHeaderBanner;
