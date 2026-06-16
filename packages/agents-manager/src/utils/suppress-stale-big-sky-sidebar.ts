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

const RETRY_DELAYS_MS = [ 100, 500, 1500 ];

type SuppressedSurfaceState = {
	hidden: boolean;
	ariaHidden: string | null;
};

const suppressedSurfaces = new Map< HTMLElement, SuppressedSurfaceState >();
const strippedLayoutClasses = new Map< HTMLElement, Set< string > >();

function getAgentsManagerData() {
	return typeof agentsManagerData !== 'undefined' ? agentsManagerData : undefined;
}

function getCurrentPostType(): string | undefined {
	try {
		const postType = select( 'core/editor' )?.getCurrentPostType?.();
		return typeof postType === 'string' ? postType : undefined;
	} catch {
		return undefined;
	}
}

function isPostEditorScreen(): boolean {
	const currentPostType = getCurrentPostType();
	if ( currentPostType !== undefined ) {
		return currentPostType === 'post';
	}

	return (
		document.body.classList.contains( 'post-type-post' ) &&
		document.body.classList.contains( 'block-editor-page' ) &&
		( document.body.classList.contains( 'post-php' ) ||
			document.body.classList.contains( 'post-new-php' ) )
	);
}

export function shouldSuppressStaleBigSkySidebar(): boolean {
	if ( typeof document === 'undefined' ) {
		return false;
	}

	const data = getAgentsManagerData();
	if ( data?.sectionName !== 'gutenberg' ) {
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

	return isPostEditorScreen();
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

		.${ SUPPRESSION_CLASS } .block-editor .big-sky-sidebar-container.big-sky-sidebar-container--sidebar-open .edit-post-layout {
			border-radius: 0 !important;
			margin: 0 !important;
			overflow: visible !important;
			width: 100% !important;
		}

		.${ SUPPRESSION_CLASS } .block-editor .big-sky-sidebar-container.big-sky-sidebar-container--sidebar-open .admin-ui-navigable-region.interface-interface-skeleton__actions,
		.${ SUPPRESSION_CLASS } .block-editor .big-sky-sidebar-container.big-sky-sidebar-container--sidebar-open .editor-post-publish-panel,
		.${ SUPPRESSION_CLASS } .block-editor .big-sky-sidebar-container.big-sky-sidebar-container--sidebar-open .interface-navigable-region.interface-interface-skeleton__actions {
			border-radius: 0 !important;
			left: auto !important;
			margin: 0 !important;
			overflow: visible !important;
			right: 0 !important;
		}
	`;

	document.head.appendChild( style );
}

function suppressSurface( el: HTMLElement ): void {
	if ( ! suppressedSurfaces.has( el ) ) {
		suppressedSurfaces.set( el, {
			hidden: Boolean( el.hidden ),
			ariaHidden: el.getAttribute( 'aria-hidden' ),
		} );
	}

	el.hidden = true;
	el.setAttribute( 'aria-hidden', 'true' );
}

function stripBigSkyLayoutClasses(): void {
	for ( const className of BIG_SKY_LAYOUT_CLASSES ) {
		document.querySelectorAll< HTMLElement >( `.${ className }` ).forEach( ( el ) => {
			const strippedClasses = strippedLayoutClasses.get( el ) ?? new Set< string >();

			strippedClasses.add( className );
			strippedLayoutClasses.set( el, strippedClasses );
			el.classList.remove( className );
		} );
	}
}

export function clearStaleBigSkySidebarSuppression(): void {
	if ( typeof document === 'undefined' ) {
		return;
	}

	document.documentElement.classList.remove( SUPPRESSION_CLASS );
	document.getElementById( SUPPRESSION_STYLE_ID )?.remove();

	for ( const [ el, state ] of suppressedSurfaces ) {
		el.hidden = state.hidden;

		if ( state.ariaHidden === null ) {
			el.removeAttribute( 'aria-hidden' );
		} else {
			el.setAttribute( 'aria-hidden', state.ariaHidden );
		}
	}

	suppressedSurfaces.clear();

	for ( const [ el, classNames ] of strippedLayoutClasses ) {
		el.classList.add( ...classNames );
	}

	strippedLayoutClasses.clear();
}

export function suppressStaleBigSkySidebar(): boolean {
	if ( ! shouldSuppressStaleBigSkySidebar() ) {
		clearStaleBigSkySidebarSuppression();
		return false;
	}

	// Temporary AM guard while Big Sky updates its Agents Manager class detection.
	ensureSuppressionStyle();
	document.documentElement.classList.add( SUPPRESSION_CLASS );

	document
		.querySelectorAll< HTMLElement >( BIG_SKY_SURFACE_SELECTORS.join( ',' ) )
		.forEach( suppressSurface );
	stripBigSkyLayoutClasses();

	return true;
}

export function startSuppressingStaleBigSkySidebar(): () => void {
	if ( typeof window === 'undefined' || typeof MutationObserver === 'undefined' ) {
		suppressStaleBigSkySidebar();
		return clearStaleBigSkySidebarSuppression;
	}

	if ( ! shouldSuppressStaleBigSkySidebar() ) {
		clearStaleBigSkySidebarSuppression();
		return () => {};
	}

	suppressStaleBigSkySidebar();

	const observer = new MutationObserver( () => {
		suppressStaleBigSkySidebar();
	} );
	const retryTimers = RETRY_DELAYS_MS.map( ( delay ) =>
		window.setTimeout( suppressStaleBigSkySidebar, delay )
	);

	observer.observe( document.body, {
		attributes: true,
		attributeFilter: [ 'class' ],
	} );

	return () => {
		observer.disconnect();
		retryTimers.forEach( window.clearTimeout );
		clearStaleBigSkySidebarSuppression();
	};
}
