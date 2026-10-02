import { bumpStat } from './analytics';

let reported = false;

function reportRecovery() {
	if ( ! reported ) {
		reported = true;
		bumpStat( 'dashboard_dom_guard', 'recovered' );
	}
}

/**
 * Browser translation tools (Google Translate in particular) replace React-managed
 * text nodes with `<font>` wrappers, so React's next commit throws NotFoundError
 * when `insertBefore`/`removeChild` reference a node that is no longer where React
 * left it (https://github.com/facebook/react/issues/11538). Recover instead of
 * crashing the whole route: append when the reference node is gone, no-op when the
 * child is already detached.
 */
export function installDomMutationGuard() {
	if ( typeof Node !== 'function' || ! Node.prototype ) {
		return;
	}

	const originalRemoveChild = Node.prototype.removeChild;
	Node.prototype.removeChild = function < T extends Node >( this: Node, child: T ): T {
		if ( child.parentNode !== this ) {
			reportRecovery();
			return child;
		}
		return originalRemoveChild.call( this, child ) as T;
	};

	const originalInsertBefore = Node.prototype.insertBefore;
	Node.prototype.insertBefore = function < T extends Node >(
		this: Node,
		newNode: T,
		referenceNode: Node | null
	): T {
		if ( referenceNode && referenceNode.parentNode !== this ) {
			reportRecovery();
			return originalInsertBefore.call( this, newNode, null ) as T;
		}
		return originalInsertBefore.call( this, newNode, referenceNode ) as T;
	};
}
