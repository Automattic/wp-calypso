import { useCallback, useEffect, useRef } from 'react';

type DisposableEffectProps = (
	effect: ( dispose: () => void ) => void,
	deps: React.DependencyList
) => void;

const useDisposableEffect: DisposableEffectProps = ( effect, deps ) => {
	const wasDisposed = useRef( false );

	const dispose = useCallback( () => {
		wasDisposed.current = true;
	}, [] );

	useEffect( () => {
		if ( ! wasDisposed.current ) {
			effect( dispose );
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, deps );
};

export default useDisposableEffect;
