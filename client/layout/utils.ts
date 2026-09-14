import { useRef } from 'react';
import { shouldUseStepContainerV2 } from 'calypso/landing/stepper/declarative-flow/helpers/should-use-step-container-v2';
import { DEFAULT_FLOW, getFlowFromURL } from 'calypso/landing/stepper/utils/get-flow-from-url';
import { isWpMobileApp } from 'calypso/lib/mobile-app';
import { getOmnibarElement } from 'calypso/lib/omnibar-element';

export function shouldLoadInlineHelp( sectionName: string, currentRoute: string ) {
	if ( isWpMobileApp() ) {
		return false;
	}

	const exemptedSections = [ 'jetpack-connect', 'help', 'home' ];
	const exemptedRoutes = [ '/log-in/jetpack' ];
	const exemptedRoutesStartingWith = [
		'/start/p2',
		'/start/newsletter',
		'/plugins/domain',
		'/plugins/marketplace/setup',
	];

	return (
		! exemptedSections.includes( sectionName ) &&
		! exemptedRoutes.includes( currentRoute ) &&
		! exemptedRoutesStartingWith.some( ( startsWithString ) =>
			currentRoute.startsWith( startsWithString )
		)
	);
}

/**
 * Drops the inline styles `handleScroll` and `syncSidebarHeight` write.
 */
export function clearSidebarScrollStyles(): void {
	document.getElementById( 'content' )?.removeAttribute( 'style' );
	document.getElementById( 'secondary' )?.removeAttribute( 'style' );
}

type LayoutMetrics = {
	windowHeight: number;
	secondaryEl: HTMLElement | null;
	secondaryElHeight?: number;
	masterbarHeight?: number;
};

/**
 * Sizes `#content` so the window can scroll far enough to reveal a sidebar taller than
 * the viewport, and returns the measurements it took.
 */
export function syncSidebarHeight(): LayoutMetrics {
	const windowHeight = window.innerHeight;
	const contentEl = document.getElementById( 'content' );
	const secondaryEl = document.getElementById( 'secondary' ); // Or referred as sidebar.
	const secondaryElHeight = secondaryEl?.scrollHeight;
	const masterbarHeight = getOmnibarElement()?.getBoundingClientRect().height;

	// Check whether we need to adjust content height so that scroll events are triggered.
	// Sidebar has overflow: initial and position:fixed, so content is our only chance for scroll events.
	if ( contentEl && secondaryEl && masterbarHeight && secondaryElHeight ) {
		if ( secondaryElHeight + masterbarHeight > windowHeight ) {
			contentEl.style.minHeight = `${ secondaryElHeight + masterbarHeight }px`;
		} else {
			contentEl.style.removeProperty( 'min-height' );
			// In case that window is taller than the sidebar after resize we need to clean up any previously set inline styles
			secondaryEl.removeAttribute( 'style' );
		}
	}

	return { windowHeight, secondaryEl, secondaryElHeight, masterbarHeight };
}

export const handleScroll = (): void => {
	const { windowHeight, secondaryEl, secondaryElHeight, masterbarHeight } = syncSidebarHeight();

	if ( ! secondaryEl || ! secondaryElHeight || ! masterbarHeight ) {
		return;
	}

	if ( secondaryElHeight + masterbarHeight <= windowHeight ) {
		// The menu fits, and `syncSidebarHeight` has already handed it back to the stylesheet.
		return;
	}

	const maxScroll = secondaryElHeight + masterbarHeight - windowHeight;
	const scrollY = -document.body.getBoundingClientRect().top; // Negative while overscrolling.

	if ( scrollY > maxScroll ) {
		secondaryEl.style.position = 'fixed';
		secondaryEl.style.top = 'auto';
		secondaryEl.style.bottom = '0';
	} else if ( scrollY <= 0 ) {
		secondaryEl.style.position = 'fixed';
		secondaryEl.style.top = `${ masterbarHeight }px`;
		secondaryEl.style.bottom = '0';
	} else {
		secondaryEl.style.position = 'absolute';
		secondaryEl.style.top = `${ masterbarHeight }px`;
		secondaryEl.style.bottom = 'auto';
	}
};

const getFlowFromRedirectURL = ( redirectTo: string ) => {
	if ( ! redirectTo ) {
		return '';
	}

	const { pathname, search } = new URL( redirectTo, 'http://example.com' );

	return getFlowFromURL( pathname, search );
};

const isRedirectingToStepContainerV2Flow = ( redirectTo: string ) => {
	return shouldUseStepContainerV2( getFlowFromRedirectURL( redirectTo ) );
};

const isMarketplaceThankYouRedirect = ( redirectTo: string ) => {
	const { pathname, searchParams } = new URL( redirectTo, 'http://example.com' );

	return pathname.startsWith( '/marketplace' ) && searchParams.has( 'onboarding' );
};

/**
 * Returns whether to display the StepContainerV2 features from up in the tree.
 * This can be used, for example, to determine if we should show
 * the StepContainerV2 loader or hide the masterbar.
 */
export const isInStepContainerV2FlowContext = ( pathname: string, query: string ) => {
	if ( pathname.startsWith( '/setup' ) ) {
		return shouldUseStepContainerV2( getFlowFromURL( pathname, query ) || DEFAULT_FLOW );
	}

	if ( pathname.startsWith( '/checkout' ) ) {
		// The checkout isn't technically part of a stepper flow, but we can infer what stepper
		// flow it came from (if any) by inspecting the redirect_to query param (in the case
		// of the onboarding flow).
		const params = new URLSearchParams( query );
		const redirectTo = params.get( 'redirect_to' ) ?? '';
		const cancelTo = params.get( 'cancel_to' ) ?? '';

		if ( isRedirectingToStepContainerV2Flow( redirectTo ) ) {
			return true;
		}

		if ( isRedirectingToStepContainerV2Flow( cancelTo ) ) {
			return true;
		}

		if ( isMarketplaceThankYouRedirect( redirectTo ) ) {
			return true;
		}
	}

	if ( pathname.startsWith( '/marketplace' ) ) {
		const params = new URLSearchParams( query );

		if ( params.has( 'onboarding' ) ) {
			return true;
		}

		const redirectTo = params.get( 'redirect_to' ) ?? '';

		return isMarketplaceThankYouRedirect( redirectTo );
	}

	return false;
};

export const useInitialIsInStepContainerV2FlowContext = () => {
	const ref = useRef(
		isInStepContainerV2FlowContext( window.location.pathname, window.location.search )
	);

	return ref.current;
};

/**
 * Returns the stepper flow name associated with the current page, if any.
 * On `/setup` this is the flow in the URL. On `/checkout` the flow (if any) is
 * inferred from the `redirect_to`/`cancel_to` query params, since checkout
 * itself isn't part of a stepper flow.
 */
export const getStepperFlowFromContext = ( pathname: string, query: string ): string => {
	if ( pathname.startsWith( '/setup' ) ) {
		return getFlowFromURL( pathname, query );
	}

	if ( pathname.startsWith( '/checkout' ) ) {
		const params = new URLSearchParams( query );
		const redirectTo = params.get( 'redirect_to' ) ?? '';
		const cancelTo = params.get( 'cancel_to' ) ?? '';

		return getFlowFromRedirectURL( redirectTo ) || getFlowFromRedirectURL( cancelTo );
	}

	return '';
};

export const useInitialStepperFlowFromContext = () => {
	const ref = useRef(
		getStepperFlowFromContext( window.location.pathname, window.location.search )
	);

	return ref.current;
};
