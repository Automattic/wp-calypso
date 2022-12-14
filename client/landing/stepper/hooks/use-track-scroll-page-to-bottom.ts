import { useEffect, useRef } from 'react';

type OptionalProps = {
	[ key: string ]: unknown;
};

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};

const useTrackScrollPageToBottom = ( enabled: boolean, onEnd: () => void , optionalProps?: OptionalProps ) => {
	const prevScrollY = useRef( window.scrollY );

	useEffect( () => {
		if ( ! enabled ) {
			return noop;
		}

		const onScroll = () => {
			const scrollPosition = window.pageYOffset;
			const documentHeight = document.body.scrollHeight;
			const viewportHeight = window.innerHeight;

			if ( scrollPosition >= documentHeight - viewportHeight ) {
				onEnd();

				// Only trigger this event once
				window.removeEventListener( 'scroll', onScroll );
			}

			prevScrollY.current = window.scrollY;
		};

		window.addEventListener( 'scroll', onScroll );

		return () => {
			window.removeEventListener( 'scroll', onScroll );
		};
	}, [ enabled, onEnd, optionalProps ] );
};

export default useTrackScrollPageToBottom;
