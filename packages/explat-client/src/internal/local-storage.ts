/**
 * LocalStorage polyfill from https://gist.github.com/juliocesar/926500
 * length and key methods were added to allow for implementing removeExpiredExperimentAssignments
 * Exported only for testing purposes
 */
export const polyfilledLocalStorage: Storage = {
	_data: {} as Record< string, string >,
	setItem: function ( id: string, val: string ): void {
		this._data[ id ] = val;
	},
	getItem: function ( id: string ): string | null {
		return this._data.hasOwnProperty( id ) ? this._data[ id ] : null;
	},
	removeItem: function ( id: string ): void {
		delete this._data[ id ];
	},
	clear: function (): void {
		this._data = {};
	},
	get length(): number {
		return Object.keys( this._data ).length;
	},
	key: function ( index: number ): string | null {
		const keys = Object.keys( this._data );
		return index in keys ? keys[ index ] : null;
	},
};

/**
 * A polyfilled LocalStorage.
 * The polyfill is required at least for testing.
 */
let localStorage = polyfilledLocalStorage;
try {
	if ( window.localStorage ) {
		localStorage = window.localStorage;
	}
} catch ( e ) {}

export default localStorage;
