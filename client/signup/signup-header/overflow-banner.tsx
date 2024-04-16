import { css, Global } from '@emotion/react';
import { useEffect, useState } from '@wordpress/element';
import classnames from 'classnames';
import { ReactNode, forwardRef } from 'react';
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

const SignupHeaderBanner = ( {
	children,
	sticky,
	stickyBannerOffset = 40,
}: {
	sticky?: boolean;
	stickyBannerOffset?: number;
	children: ( isStuck: boolean ) => ReactNode;
} ) => {
	const [ isAboveOffset, setIsAboveOffset ] = useState( false );

	useEffect( () => {
		const handleScroll = () => {
			const scrollY = window.scrollY;
			if ( scrollY > stickyBannerOffset ) {
				setIsAboveOffset( true );
			} else {
				setIsAboveOffset( false );
			}
		};

		window.addEventListener( 'scroll', handleScroll );

		return () => {
			window.removeEventListener( 'scroll', handleScroll );
		};
	}, [] );

	const classes = classnames( 'signup-header__overflow-banner', {
		'is-sticky-banner': isAboveOffset && sticky,
		'is-header-banner': ! isAboveOffset || ! sticky,
	} );

	return (
		<>
			<Global styles={ globalStyleOverrides } />
			<div className={ classes }>{ children( Boolean( isAboveOffset && sticky ) ) }</div>
		</>
	);
};

export default forwardRef( SignupHeaderBanner );
