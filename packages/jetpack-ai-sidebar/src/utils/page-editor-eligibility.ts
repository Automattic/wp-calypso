import { select, subscribe } from '@wordpress/data';
import { useSyncExternalStore } from '@wordpress/element';

type VisibilityInput = {
	isWpcomPlatform?: boolean;
	isSidebarEnabled?: boolean;
	currentPostType?: string;
	currentPostId?: string | number;
	pathname: string;
	search: string;
	bodyClasses: readonly string[];
};

export type JetpackAiSidebarVisibility = {
	isPageOnly: boolean;
	isVisible: boolean;
};

const LOCATION_CHANGE_EVENT = 'jetpackAiSidebarLocationChange';
const UNRESTRICTED_VISIBILITY: JetpackAiSidebarVisibility = {
	isPageOnly: false,
	isVisible: true,
};
const PAGE_ONLY_VISIBLE: JetpackAiSidebarVisibility = { isPageOnly: true, isVisible: true };
const PAGE_ONLY_HIDDEN: JetpackAiSidebarVisibility = { isPageOnly: true, isVisible: false };

function isRegularPageEditorRoute(
	pathname: string,
	search: string,
	bodyClasses: readonly string[],
	currentPostId?: string | number
): boolean {
	const params = new URLSearchParams( search );

	if ( pathname.endsWith( '/wp-admin/post-new.php' ) ) {
		return bodyClasses.includes( 'post-new-php' ) && params.get( 'post_type' ) === 'page';
	}

	if (
		! pathname.endsWith( '/wp-admin/post.php' ) ||
		( ! bodyClasses.includes( 'post-php' ) && ! bodyClasses.includes( 'post-new-php' ) )
	) {
		return false;
	}

	const routePostId = params.get( 'post' );
	return (
		params.get( 'action' ) === 'edit' &&
		/^\d+$/.test( routePostId ?? '' ) &&
		String( currentPostId ) === routePostId
	);
}

function getSiteEditorPageId( pathname: string, search: string ): string | undefined {
	if ( ! pathname.endsWith( '/wp-admin/site-editor.php' ) ) {
		return undefined;
	}

	const params = new URLSearchParams( search );
	if ( params.get( 'canvas' ) !== 'edit' ) {
		return undefined;
	}

	const entityPath = params.get( 'p' );
	if ( entityPath !== null ) {
		return entityPath.match( /^\/page\/(\d+)\/?$/ )?.[ 1 ];
	}

	const legacyPostId = params.get( 'postId' );
	return params.get( 'postType' ) === 'page' && /^\d+$/.test( legacyPostId ?? '' )
		? legacyPostId ?? undefined
		: undefined;
}

export function getJetpackAiSidebarVisibility( {
	isWpcomPlatform,
	isSidebarEnabled,
	currentPostType,
	currentPostId,
	pathname,
	search,
	bodyClasses,
}: VisibilityInput ): JetpackAiSidebarVisibility {
	const isPageOnly = isWpcomPlatform === false && isSidebarEnabled === true;

	if ( ! isPageOnly ) {
		return UNRESTRICTED_VISIBILITY;
	}

	const siteEditorPageId = getSiteEditorPageId( pathname, search );
	const isPageEditor =
		currentPostType === 'page' &&
		( isRegularPageEditorRoute( pathname, search, bodyClasses, currentPostId ) ||
			( siteEditorPageId !== undefined && String( currentPostId ) === siteEditorPageId ) );

	return isPageEditor ? PAGE_ONLY_VISIBLE : PAGE_ONLY_HIDDEN;
}

function patchHistoryOnce(): void {
	const patchedWindow = window as Window & { __jetpackAiSidebarHistoryPatched?: boolean };
	if ( patchedWindow.__jetpackAiSidebarHistoryPatched ) {
		return;
	}
	patchedWindow.__jetpackAiSidebarHistoryPatched = true;

	// Site Editor History API writes emit no navigation event, so keep one wrapper for the page lifetime.
	( [ 'pushState', 'replaceState' ] as const ).forEach( ( method ) => {
		const original = window.history[ method ];
		window.history[ method ] = function ( ...args ) {
			const result = original.apply( this, args );
			window.dispatchEvent( new Event( LOCATION_CHANGE_EVENT ) );
			return result;
		};
	} );
}

function subscribeToLocation( notify: () => void ): () => void {
	const isSiteEditor =
		window.location.pathname.endsWith( '/wp-admin/site-editor.php' ) ||
		document.body.classList.contains( 'site-editor-php' );

	if ( ! isSiteEditor ) {
		return () => {};
	}

	patchHistoryOnce();
	window.addEventListener( 'popstate', notify );
	window.addEventListener( LOCATION_CHANGE_EVENT, notify );

	return () => {
		window.removeEventListener( 'popstate', notify );
		window.removeEventListener( LOCATION_CHANGE_EVENT, notify );
	};
}

function readVisibility(): JetpackAiSidebarVisibility {
	const editor = select( 'core/editor' ) as
		| {
				getCurrentPostId?: () => string | number | undefined;
				getCurrentPostType?: () => string | undefined;
		  }
		| undefined;
	const data = typeof agentsManagerData !== 'undefined' ? agentsManagerData : undefined;

	return getJetpackAiSidebarVisibility( {
		isWpcomPlatform: data?.isWpcomPlatform,
		isSidebarEnabled: data?.jetpackAiSidebar?.enabled,
		currentPostType: editor?.getCurrentPostType?.(),
		currentPostId: editor?.getCurrentPostId?.(),
		pathname: window.location.pathname,
		search: window.location.search,
		bodyClasses: Array.from( document.body.classList ),
	} );
}

// The block-toolbar HOC mounts once per block, so share one editor/location subscription.
const visibilityListeners = new Set< () => void >();
let currentVisibility: JetpackAiSidebarVisibility | undefined;
let unsubscribeFromData: ( () => void ) | undefined;
let unsubscribeFromLocation: ( () => void ) | undefined;

function refreshVisibility(): void {
	const nextVisibility = readVisibility();
	if ( nextVisibility === currentVisibility ) {
		return;
	}

	currentVisibility = nextVisibility;
	visibilityListeners.forEach( ( listener ) => listener() );
}

function getVisibilitySnapshot(): JetpackAiSidebarVisibility {
	currentVisibility ??= readVisibility();
	return currentVisibility;
}

function subscribeToVisibility( listener: () => void ): () => void {
	visibilityListeners.add( listener );

	if ( visibilityListeners.size === 1 ) {
		currentVisibility = readVisibility();
		unsubscribeFromData = subscribe( refreshVisibility, 'core/editor' );
		unsubscribeFromLocation = subscribeToLocation( refreshVisibility );
	}

	return () => {
		visibilityListeners.delete( listener );
		if ( visibilityListeners.size > 0 ) {
			return;
		}

		unsubscribeFromData?.();
		unsubscribeFromLocation?.();
		unsubscribeFromData = undefined;
		unsubscribeFromLocation = undefined;
		currentVisibility = undefined;
	};
}

export function useJetpackAiSidebarVisibility(): JetpackAiSidebarVisibility {
	return useSyncExternalStore( subscribeToVisibility, getVisibilitySnapshot );
}
