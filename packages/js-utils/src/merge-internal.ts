export type PlainObject = Record< string, unknown >;

export const isPlainObject = ( value: unknown ): value is PlainObject => {
	if ( value === null || typeof value !== 'object' ) {
		return false;
	}
	const proto = Object.getPrototypeOf( value );
	return proto === null || proto === Object.prototype;
};

// Values the merge recurses into rather than assigning by reference: arrays and
// plain objects. Everything else (Dates, class instances, functions, typed
// arrays, …) is copied by reference.
export const isMergeable = ( value: unknown ): boolean =>
	Array.isArray( value ) || isPlainObject( value );

// Reads `constructor` as absent when it holds the built-in function, so a source
// `constructor` merges into a fresh own property instead of the real
// constructor. `__proto__` is skipped by callers before this is reached.
export const safeGet = ( object: PlainObject, key: string ): unknown => {
	if ( key === 'constructor' && typeof object[ key ] === 'function' ) {
		return undefined;
	}
	return object[ key ];
};

// Picks the destination container to deep-merge a mergeable `srcValue` into:
// reuse a type-compatible existing `objValue` so nested values merge in place,
// otherwise start a fresh container to copy into.
export const pickMergeContainer = (
	objValue: unknown,
	srcValue: unknown
): PlainObject | unknown[] => {
	if ( Array.isArray( srcValue ) ) {
		return Array.isArray( objValue ) ? objValue : [];
	}
	if ( objValue !== null && typeof objValue === 'object' ) {
		return objValue as PlainObject;
	}
	return {};
};

// Assigns like a sloppy-mode write. `Reflect.set` reports a rejected data-
// property write — a frozen or sealed object, a non-extensible object gaining a
// new key, or a non-writable property — as a `false` return rather than
// throwing, so the merge keeps going.
// Exceptions thrown by a userland setter still propagate.
// A plain strict-mode assignment would instead throw on the rejected write and
// abort the whole merge.
export const assign = ( target: PlainObject, key: string, value: unknown ): void => {
	Reflect.set( target, key, value );
};
