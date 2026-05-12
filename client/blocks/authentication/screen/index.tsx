import { Step } from '@automattic/onboarding';
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
	 * Width of the centered content column, in twelfths. Mirrors
	 * `Step.CenteredColumnLayout`'s `columnWidth` prop.
	 */
	columnWidth?: 4 | 5 | 6 | 8 | 10;
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
	columnWidth = 6,
	children,
}: ScreenProps ) => (
	<Step.CenteredColumnLayout
		columnWidth={ columnWidth }
		verticalAlign="center"
		topBar={ <Step.TopBar rightElement={ topBarAction } compactLogo="always" /> }
		heading={
			<div className="auth-screen__heading">
				<Step.Heading text={ heading } />
				{ notice && <div className="auth-screen__notice">{ notice }</div> }
				{ subheading && <h2 className="auth-screen__subheading">{ subheading }</h2> }
			</div>
		}
	>
		{ children }
	</Step.CenteredColumnLayout>
);

export default Screen;
