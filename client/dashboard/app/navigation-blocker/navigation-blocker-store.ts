import { __ } from '@wordpress/i18n';

class NavigationBlockerStore {
	private registry = new Map< string, string >();
	private skipBeforeUnload = false;

	set( id: string, message: string = '' ) {
		this.registry.set( id, message );
	}

	delete( id: string ) {
		this.registry.delete( id );
	}

	getSnapshot() {
		const shouldBlock = this.registry.size > 0;
		const message =
			Array.from( this.registry.values() ).find( Boolean ) ??
			__( 'You have unsaved changes. Are you sure you want to leave?' );

		return { shouldBlock, message };
	}

	/**
	 * Lets the next page unload go ahead without the browser's "Leave site?" prompt.
	 */
	skipNextBeforeUnload() {
		this.skipBeforeUnload = true;
	}

	shouldBlockBeforeUnload() {
		if ( this.skipBeforeUnload ) {
			this.skipBeforeUnload = false;
			return false;
		}

		return this.getSnapshot().shouldBlock;
	}
}

export const navigationStore = new NavigationBlockerStore();
