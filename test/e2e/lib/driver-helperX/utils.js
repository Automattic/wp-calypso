export function resolveToBool( pendingPromise ) {
	return pendingPromise.then(
		( v ) => !! v,
		() => false
	);
}

export function resolveToValue( pendingPromise ) {
	return pendingPromise.then(
		( v ) => ( v ? v : null ),
		() => null
	);
}
