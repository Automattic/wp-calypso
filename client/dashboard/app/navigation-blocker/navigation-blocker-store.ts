import { __ } from '@wordpress/i18n';

type Callback = () => void;

class NavigationBlockerStore {
	private subscribers = new Set< Callback >();
	private registry = new Map< string, string >();
	private snapshot: { shouldBlock: boolean; message: string } | null = null;

	subscribe( callback: Callback ) {
		this.subscribers.add( callback );
		return () => this.subscribers.delete( callback );
	}

	set( id: string, message: string = '' ) {
		this.registry.set( id, message );
		this.updateSnapshot();
		this.emit();
	}

	delete( id: string ) {
		this.registry.delete( id );
		this.updateSnapshot();
		this.emit();
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

	private emit() {
		this.subscribers.forEach( ( callback ) => callback() );
	}
}

export const navigationStore = new NavigationBlockerStore();
