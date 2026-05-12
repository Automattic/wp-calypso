import { Step } from '@automattic/onboarding';
import clsx from 'clsx';
import type { ReactNode } from 'react';

import './style.scss';

type ScreenProps = {
	/**
	 * Optional element rendered on the trailing edge of the top bar — typically
	 * a context-specific link like "Create an account" or "Log in".
	 */
	topBarAction?: ReactNode;
	/**
	 * The h1 text for the screen. Rendered in the Recoleta brand font via
	 * the underlying Step.Heading.
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
	 * When true, the content row caps at the Figma 2-col desktop wrapper
	 * width (768px) so a consumer can lay out two columns side-by-side
	 * (input-CTA + social options, with a vertical OR between them). When
	 * false (default), the content row caps at 400px — the 1-col desktop
	 * width used by lost-password, magic-link, 2FA, social-connect,
	 * continue-as-user, etc.
	 */
	wide?: boolean;
	/**
	 * The content of the screen — typically a composition of the foundation
	 * content blocks (TextField, PrimaryButton, OptionsList, etc.).
	 */
	children: ReactNode;
};

const Screen = ( {
	topBarAction,
	heading,
	subheading,
	notice,
	wide = false,
	children,
}: ScreenProps ) => (
	<div className={ clsx( 'auth-screen', { 'is-wide': wide } ) }>
		<Step.CenteredColumnLayout
			columnWidth={ wide ? 8 : 6 }
			verticalAlign="center"
			topBar={ <Step.TopBar rightElement={ topBarAction } compactLogo="always" /> }
			heading={
				<div className="auth-screen__heading">
					<Step.Heading text={ heading } />
					{ notice && <div className="auth-screen__notice">{ notice }</div> }
					{ subheading && <p className="auth-screen__subheading">{ subheading }</p> }
				</div>
			}
		>
			{ children }
		</Step.CenteredColumnLayout>
	</div>
);

export default Screen;
