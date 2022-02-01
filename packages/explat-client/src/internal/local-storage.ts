/**
 * LocalStorage polyfill from https://gist.github.com/juliocesar/926500
 * length and key methods were added to allow for implementing removeExpiredExperimentAssignments
 * Exported only for testing purposes
 */
export const polyfilledLocalStorage = {
	_data: {} as Record< string, string >,
	setItem: function ( id: string, val: string ): void {
		this._data[ id ] = val;
	},
	getItem: function ( id: string ): string | undefined {
		return this._data.hasOwnProperty( id ) ? this._data[ id ] : undefined;
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
	key: function ( index: number ): string | undefined {
		return Object.keys( this._data )[ index ];
	},
};

/**
 * A polyfilled LocalStorage.
 * The polyfill is required at least for testing.
 */
const localStorage =
	typeof window !== 'undefined' && window.localStorage
		? window.localStorage
		: polyfilledLocalStorage;

export default localStorage;
