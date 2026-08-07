import { bumpStat } from '../analytics';

/**
 * Page translators (Google Translate) and extensions rewrite text nodes React
 * manages, so React's cached references get reparented and its commit-phase
 * `insertBefore`/`removeChild` throw `NotFoundError`, crashing the whole tree
 * (Sentry CALYPSO-3G00). These guards no-op the reparented case instead.
 *
 * This is a well known issue in React, and this snippet comes from there.
 * See https://github.com/facebook/react/issues/11538.
 */

const reported = new Set< string >();

// Bump a stat once per operation per session so we can watch how often the guard
// fires. This is a counter, not an error, so it goes to stats rather than Sentry.
function reportOnce( operation: 'insertBefore' | 'removeChild' ) {
	if ( reported.has( operation ) ) {
		return;
	}
	reported.add( operation );
	bumpStat( 'dashboard-dom-mutation-guard', operation );
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
