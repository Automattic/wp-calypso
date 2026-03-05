export function invokeSurvicateEvent( eventName: string ): boolean {
	if ( typeof window._sva !== 'undefined' && window._sva.invokeEvent ) {
		window._sva.invokeEvent( eventName );
		return true;
	}
	return false;
}
