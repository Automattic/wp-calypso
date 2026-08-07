import { captureMessage } from '@automattic/calypso-sentry';

/**
 * Guards React against third-party DOM mutation.
 *
 * Browser page-translation (Google Translate, Edge) and extensions such as
 * Grammarly rewrite the text nodes React manages — wrapping them in `<font>`
 * tags, or splitting and relocating them. React still holds references to the
 * original nodes and later calls `parent.insertBefore( newNode, ref )` or
 * `parent.removeChild( child )` against a node whose parent has since changed.
 * The browser then throws `NotFoundError: ... not a child of this node` from
 * the commit phase, which escapes error boundaries and tears down the whole
 * React tree (Sentry CALYPSO-3G00 / CALYPSO-1WJF).
 *
 * These guards make the two operations no-op when the reference/child node has
 * been reparented, turning a hard crash into an occasional, self-correcting
 * visual glitch. See https://github.com/facebook/react/issues/11538.
 */

let hasReported = false;

// One event per session is enough to measure how often the guard fires without
// flooding Sentry (which itself only loads for a sample of requests).
function reportOnce( operation: 'insertBefore' | 'removeChild' ) {
	if ( hasReported ) {
		return;
	}
	hasReported = true;
	captureMessage( 'DOM mutation guard suppressed a React reconciliation crash', {
		level: 'warning',
		tags: { dom_mutation_guard: operation },
	} );
}

export function installDomMutationGuard() {
	if ( typeof Node !== 'function' || ! Node.prototype ) {
		return;
	}

	const originalInsertBefore = Node.prototype.insertBefore;
	Node.prototype.insertBefore = function < T extends Node >(
		this: Node,
		node: T,
		child: Node | null
	): T {
		if ( child && child.parentNode !== this ) {
			reportOnce( 'insertBefore' );
			return node;
		}
		return originalInsertBefore.call( this, node, child ) as T;
	};

	const originalRemoveChild = Node.prototype.removeChild;
	Node.prototype.removeChild = function < T extends Node >( this: Node, child: T ): T {
		if ( child.parentNode !== this ) {
			reportOnce( 'removeChild' );
			return child;
		}
		return originalRemoveChild.call( this, child ) as T;
	};
}
