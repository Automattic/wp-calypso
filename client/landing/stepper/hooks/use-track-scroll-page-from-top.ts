import { resolveDeviceTypeByViewPort } from '@automattic/viewport';
import { useEffect, useRef } from 'react';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';

type OptionalProps = {
	[ key: string ]: unknown;
};

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};

const useTrackScrollPageFromTop = (
	enabled: boolean,
	flow: string,
	step: string,
	optionalProps?: OptionalProps
) => {
	const prevScrollY = useRef( window.scrollY );

	useEffect( () => {
		if ( ! enabled ) {
			return noop;
		}

		const trackScroll = () => {
			const eventProps = {
				flow,
				step,
				device: resolveDeviceTypeByViewPort(),
				...optionalProps,
			};

			recordTracksEvent( 'calypso_signup_scroll_page', eventProps );
		};

		const onScroll = () => {
			if ( prevScrollY.current === 0 && window.scrollY > 0 ) {
				trackScroll();
				// Only trigger this event once
				window.removeEventListener( 'scroll', onScroll );
			}

			prevScrollY.current = window.scrollY;
		};

		window.addEventListener( 'scroll', onScroll );

		return () => {
			window.removeEventListener( 'scroll', onScroll );
		};
	}, [ enabled, flow, step, optionalProps ] );
};

export default useTrackScrollPageFromTop;
