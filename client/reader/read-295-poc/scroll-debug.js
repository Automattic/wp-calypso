/* eslint-disable no-console */

const DEBUG_KEY = '__read295ScrollDebug';
const LOG_PREFIX = '[READ-295][scroll]';
const TIMELINE_DURATION_MS = 7000;

function getDocumentHeight() {
	const scrollingElement = document.scrollingElement || document.documentElement;
	return scrollingElement?.scrollHeight ?? 0;
}

function getScrollSnapshot() {
	const scrollingElement = document.scrollingElement || document.documentElement;

	return {
		timestamp: Math.round( performance.now() ),
		path: window.location.pathname,
		hash: window.location.hash,
		scrollY: Math.round( window.scrollY ),
		pageYOffset: Math.round( window.pageYOffset ),
		documentScrollTop: Math.round( scrollingElement?.scrollTop ?? 0 ),
		documentHeight: Math.round( getDocumentHeight() ),
		viewportHeight: Math.round( window.innerHeight ),
	};
}

function getElementSnapshot( element ) {
	if ( ! element ) {
		return null;
	}

	const rect = element.getBoundingClientRect?.();
	return {
		tagName: element.tagName,
		className: element.className,
		id: element.id,
		scrollTop: Math.round( element.scrollTop ?? 0 ),
		scrollHeight: Math.round( element.scrollHeight ?? 0 ),
		clientHeight: Math.round( element.clientHeight ?? 0 ),
		rectTop: rect ? Math.round( rect.top ) : undefined,
		rectHeight: rect ? Math.round( rect.height ) : undefined,
	};
}

function getStack() {
	return new Error().stack?.split( '\n' ).slice( 2, 9 ).join( '\n' );
}

function log( label, data = {} ) {
	console.log( LOG_PREFIX, label, {
		...getScrollSnapshot(),
		...data,
	} );
}

function startTimeline( reason ) {
	const debugState = window[ DEBUG_KEY ];
	if ( ! debugState ) {
		return;
	}

	if ( debugState.timelineFrame ) {
		cancelAnimationFrame( debugState.timelineFrame );
	}

	const startedAt = performance.now();
	let previous = getScrollSnapshot();
	log( 'timeline start', { reason } );

	const tick = () => {
		const next = getScrollSnapshot();
		const scrollChanged = Math.abs( next.scrollY - previous.scrollY ) > 1;
		const heightChanged = Math.abs( next.documentHeight - previous.documentHeight ) > 1;

		if ( scrollChanged || heightChanged ) {
			log( 'timeline change', {
				reason,
				previous,
				next,
				scrollChanged,
				heightChanged,
			} );
			previous = next;
		}

		if ( performance.now() - startedAt < TIMELINE_DURATION_MS ) {
			debugState.timelineFrame = requestAnimationFrame( tick );
			return;
		}

		debugState.timelineFrame = null;
		log( 'timeline end', { reason } );
	};

	debugState.timelineFrame = requestAnimationFrame( tick );
}

function patchWindowScrollTo( debugState ) {
	window.scrollTo = function read295WindowScrollTo( ...args ) {
		log( 'window.scrollTo', {
			args,
			stack: getStack(),
		} );
		startTimeline( 'window.scrollTo' );
		return debugState.originalWindowScrollTo.apply( this, args );
	};
}

function patchElementScrollTo( debugState ) {
	if ( ! debugState.originalElementScrollTo ) {
		return;
	}

	window.Element.prototype.scrollTo = function read295ElementScrollTo( ...args ) {
		log( 'element.scrollTo', {
			args,
			element: getElementSnapshot( this ),
			stack: getStack(),
		} );
		startTimeline( 'element.scrollTo' );
		return debugState.originalElementScrollTo.apply( this, args );
	};
}

export function installRead295ScrollDebug() {
	if ( typeof window === 'undefined' || window[ DEBUG_KEY ]?.installed ) {
		return;
	}

	const debugState = {
		installed: true,
		originalWindowScrollTo: window.scrollTo,
		originalElementScrollTo: window.Element?.prototype?.scrollTo,
		timelineFrame: null,
		scrollFrame: null,
	};

	window[ DEBUG_KEY ] = debugState;
	patchWindowScrollTo( debugState );
	patchElementScrollTo( debugState );

	const onScroll = () => {
		if ( debugState.scrollFrame ) {
			return;
		}

		debugState.scrollFrame = requestAnimationFrame( () => {
			debugState.scrollFrame = null;
			log( 'window scroll event' );
		} );
	};

	const onPopState = () => {
		log( 'popstate' );
		startTimeline( 'popstate' );
	};

	const onPageShow = ( event ) => {
		log( 'pageshow', { persisted: event.persisted } );
		startTimeline( 'pageshow' );
	};

	const onClick = ( event ) => {
		const target = event.target?.closest?.( 'a, button, .reader__card' );
		if ( ! target ) {
			return;
		}

		log( 'click', {
			element: getElementSnapshot( target ),
			href: target.href,
		} );
		startTimeline( 'click' );
	};

	window.addEventListener( 'scroll', onScroll, { passive: true } );
	window.addEventListener( 'popstate', onPopState );
	window.addEventListener( 'pageshow', onPageShow );
	document.addEventListener( 'click', onClick, true );

	log( 'debug installed' );
	startTimeline( 'debug installed' );
}

export function logRead295ScrollDebug( label, data = {} ) {
	if ( typeof window === 'undefined' ) {
		return;
	}

	log( label, data );
}

export function startRead295ScrollDebugTimeline( reason ) {
	if ( typeof window === 'undefined' ) {
		return;
	}

	startTimeline( reason );
}

export function observeRead295ScrollDebugElement( label, element ) {
	if ( typeof window === 'undefined' || ! element || ! window.ResizeObserver ) {
		return;
	}

	let previous = getElementSnapshot( element );
	log( 'element observe start', { label, element: previous } );

	const observer = new window.ResizeObserver( () => {
		const next = getElementSnapshot( element );
		log( 'element resize', {
			label,
			previous,
			next,
		} );
		previous = next;
		startTimeline( `${ label } resize` );
	} );

	observer.observe( element );
	return () => observer.disconnect();
}
