import { WordPressLogo, WordPressWordmark } from '@automattic/components';
import clsx from 'clsx';
import type { ReactNode } from 'react';

import './style.scss';

type ScreenProps = {
	/**
	 * Optional element rendered on the leading edge of the top bar, next to
	 * the logo — typically a "Back" link that returns to the previous step
	 * (e.g. lost-password → log-in). Consumers render the button themselves
	 * so they can wire up the right destination and any client-side
	 * navigation.
	 */
	backAction?: ReactNode;
	/**
	 * Optional element rendered on the trailing edge of the top bar — typically
	 * a context-specific link like "Create an account" or "Log in".
	 */
	topBarAction?: ReactNode;
	/**
	 * The h1 text for the screen. Rendered in the Recoleta brand font when
	 * the surrounding `lang` is supported by `@automattic/typography`.
	 */
	heading: ReactNode;
	/**
	 * Optional secondary copy rendered under the heading. Use for short
	 * subtitles or the standard "By continuing…" Terms & Conditions blurb.
	 */
	subheading?: ReactNode;
	/**
	 * Optional inline notice rendered in the heading area, between the
	 * heading and subheading. Pass a `Notice` element from
	 * `calypso/dashboard/components/notice`.
	 */
	notice?: ReactNode;
	/**
	 * When true, the content area widens to 768px on `@break-medium` so a
	 * consumer can lay out two columns side-by-side (input-CTA + social
	 * options, with a vertical OR between them). When false (default),
	 * content caps at 400px — the 1-col width used by lost-password,
	 * magic-link, 2FA, social-connect, continue-as-user, etc.
	 */
	wide?: boolean;
	/**
	 * The screen's body — typically a `VStack` of WPDS primitives
	 * (`TextControl`, `Button`, `Notice`) composed with the foundation
	 * blocks (`SocialButton`, `CurrentUser`, `SocialConnectWidget`).
	 */
	children: ReactNode;
};

const Screen = ( {
	backAction,
	topBarAction,
	heading,
	subheading,
	notice,
	wide = false,
	children,
}: ScreenProps ) => (
	<div className={ clsx( 'auth-screen', { 'is-wide': wide } ) }>
		<header className="auth-screen__top-bar">
			<div className="auth-screen__top-bar-logo">
				<WordPressLogo size={ 21 } className="auth-screen__top-bar-logo-compact" />
				<WordPressWordmark color="currentColor" className="auth-screen__top-bar-logo-wordmark" />
			</div>
			{ backAction && <div className="auth-screen__top-bar-back">{ backAction }</div> }
			{ topBarAction && <div className="auth-screen__top-bar-action">{ topBarAction }</div> }
		</header>
		<main className="auth-screen__content">
			<header className="auth-screen__heading">
				<h1 className="wp-brand-font">{ heading }</h1>
				{ notice && <div className="auth-screen__notice">{ notice }</div> }
				{ subheading && <p className="auth-screen__subheading">{ subheading }</p> }
			</header>
			<div className="auth-screen__body">{ children }</div>
		</main>
	</div>
);

export default Screen;
