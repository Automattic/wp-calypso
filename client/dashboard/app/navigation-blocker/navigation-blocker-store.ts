import { __ } from '@wordpress/i18n';

class NavigationBlockerStore {
	private registry = new Map< string, string >();
	private snapshot: { shouldBlock: boolean; message: string } | null = null;

	set( id: string, message: string = '' ) {
		this.registry.set( id, message );
		this.updateSnapshot();
	}

	delete( id: string ) {
		this.registry.delete( id );
		this.updateSnapshot();
	}

	clear() {
		this.registry.clear();
		this.updateSnapshot();
	}

	confirmLeave() {
		const { shouldBlock, message } = this.getSnapshot();
		return ! shouldBlock || window.confirm( message );
	}

	getSnapshot() {
		if ( ! this.snapshot ) {
			this.updateSnapshot();
		}

		return this.snapshot!;
	}

	private updateSnapshot() {
		const shouldBlock = this.registry.size > 0;
		const message =
			Array.from( this.registry.values() ).find( Boolean ) ??
			__( 'You have unsaved changes. Are you sure you want to leave?' );

		this.snapshot = { shouldBlock, message };
	}
}

export const navigationStore = new NavigationBlockerStore();
