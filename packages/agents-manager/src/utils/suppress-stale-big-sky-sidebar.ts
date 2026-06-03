// global.d.ts declares ambient globals (e.g. agentsManagerData) that are injected server-side.
// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../global.d.ts" />

import { select } from '@wordpress/data';
import { isJetpackAiSidebarPreviewFeatureEnabled } from './jetpack-ai-sidebar-preview';

const SUPPRESSION_CLASS = 'agents-manager-suppress-stale-big-sky-sidebar';
const SUPPRESSION_STYLE_ID = 'agents-manager-suppress-stale-big-sky-sidebar-style';

const BIG_SKY_SURFACE_SELECTORS = [
	'.big-sky-sidebar',
	'.big-sky-sidebar__fab',
	'#big-sky-wp-admin-agent-root',
];

const BIG_SKY_LAYOUT_CLASSES = [
	'big-sky-sidebar-container',
	'big-sky-sidebar-container--sidebar-open',
];

function getAgentsManagerData() {
	return typeof agentsManagerData !== 'undefined' ? agentsManagerData : undefined;
}

function getCurrentPostType(): string | undefined {
	try {
		return select( 'core/editor' )?.getCurrentPostType?.();
	} catch {
		return undefined;
	}
}

export function shouldSuppressStaleBigSkySidebar(): boolean {
	if ( typeof document === 'undefined' ) {
		return false;
	}

	const data = getAgentsManagerData();
	if ( data?.sectionName && data.sectionName !== 'gutenberg' ) {
		return false;
	}

	const previewEnabled = data?.jetpackAiSidebarPreview?.enabled === true;
	const hasPreviewFeature = Object.values( data?.jetpackAiSidebarPreview?.features ?? {} ).some(
		Boolean
	);
	const jetpackAiSidebarActive =
		hasPreviewFeature ||
		!! data?.aiEditorialReviewEnabled ||
		!! data?.reviewMediatorEnabled ||
		isJetpackAiSidebarPreviewFeatureEnabled( 'aiEditorialReview', false );

	if ( ! previewEnabled || ! jetpackAiSidebarActive ) {
		return false;
	}

	return getCurrentPostType() === 'post' || document.body.classList.contains( 'post-type-post' );
}

function ensureSuppressionStyle(): void {
	if ( document.getElementById( SUPPRESSION_STYLE_ID ) ) {
		return;
	}

	const style = document.createElement( 'style' );
	style.id = SUPPRESSION_STYLE_ID;
	style.textContent = `
		.${ SUPPRESSION_CLASS } ${ BIG_SKY_SURFACE_SELECTORS.join( `,\n\t\t.${ SUPPRESSION_CLASS } ` ) } {
			display: none !important;
			visibility: hidden !important;
			pointer-events: none !important;
		}
	`;

	document.head.appendChild( style );
}

export function suppressStaleBigSkySidebar(): boolean {
	if ( ! shouldSuppressStaleBigSkySidebar() ) {
		return false;
	}

	// Temporary AM guard while Big Sky updates its Agents Manager class detection.
	ensureSuppressionStyle();
	document.documentElement.classList.add( SUPPRESSION_CLASS );

	document
		.querySelectorAll< HTMLElement >( BIG_SKY_SURFACE_SELECTORS.join( ',' ) )
		.forEach( ( el ) => {
			el.hidden = true;
			el.setAttribute( 'aria-hidden', 'true' );
		} );

	for ( const className of BIG_SKY_LAYOUT_CLASSES ) {
		document.querySelectorAll< HTMLElement >( `.${ className }` ).forEach( ( el ) => {
			el.classList.remove( className );
		} );
	}

	return true;
}

export function startSuppressingStaleBigSkySidebar(): () => void {
	if ( typeof window === 'undefined' || typeof MutationObserver === 'undefined' ) {
		suppressStaleBigSkySidebar();
		return () => {};
	}

	if ( ! shouldSuppressStaleBigSkySidebar() ) {
		return () => {};
	}

	suppressStaleBigSkySidebar();

	const observer = new MutationObserver( () => {
		suppressStaleBigSkySidebar();
	} );

	observer.observe( document.body, {
		attributes: true,
		attributeFilter: [ 'class' ],
		childList: true,
		subtree: true,
	} );

	return () => observer.disconnect();
}
