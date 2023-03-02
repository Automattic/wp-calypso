/**
 * External Dependencies
 */
import { useDispatch } from '@wordpress/data';
import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
/**
 * Internal Dependencies
 */
import './help-center-inline-chat.scss';
import { HELP_CENTER_STORE } from '../stores';

const theIframe = document.createElement( 'iframe' );
document.body.appendChild( theIframe );
theIframe.style.display = 'none';
theIframe.style.position = 'fixed';
theIframe.style.zIndex = '100000';

// cache for a day
const cacheBuster = Math.floor( Date.now() / 1000 / 60 / 60 / 24 );

/**
 * This is a pretty novel way to keep the iframe state when the Help Center is closed.
 * It creates and appends an iframe into the body. And only set it's src when a chat is started.
 * Now when the user closes the Help Center, the iframe will stay alive so that if they re-open it, they'd continue their session without starting a new one.
 * This is tricky because you can't move the iframe around the DOM without losing state, so we have to position it manually above the container, even though it's not part of the Help Center's tree at all!
 */
function PersistentIframe( { src }: { src: string } ) {
	const { setIframe } = useDispatch( HELP_CENTER_STORE );
	const container = useRef< HTMLDivElement >( null );

	useEffect( () => {
		if ( ! container.current ) {
			return;
		}
		const containerElement = container.current;

		let isMouseDown = false;

		function handler( event: MouseEvent | ResizeObserverEntry[] | UIEvent | null ) {
			// when it's an array, it means it came from ResizeObserver
			if ( isMouseDown || Array.isArray( event ) || event?.type === 'resize' ) {
				const box = containerElement.getBoundingClientRect();
				theIframe.style.display = 'block';
				theIframe.style.left = box.left + 'px';
				theIframe.style.top = box.top + 'px';
				theIframe.style.width = box.width + 'px';
				theIframe.style.height = box.height + 'px';
			}
		}

		handler( [] );

		// this is the only I could come up with to monitor dragging
		// since React-draggable is not propagating the drag event.
		function mouseDownHandler() {
			isMouseDown = true;
		}

		function mouseUpHandler() {
			isMouseDown = false;
		}

		window.addEventListener( 'resize', handler );
		window.addEventListener( 'mousemove', handler );
		window.addEventListener( 'mouseup', mouseUpHandler );
		window.addEventListener( 'mousedown', mouseDownHandler );

		const resizeObserver = new ResizeObserver( handler );
		resizeObserver.observe( containerElement );

		return () => {
			theIframe.style.display = 'none';
			window.removeEventListener( 'resize', handler );
			window.removeEventListener( 'mousemove', handler );
			window.removeEventListener( 'mouseup', mouseUpHandler );
			window.removeEventListener( 'mousedown', mouseDownHandler );
			resizeObserver.unobserve( containerElement );
		};
	}, [ container ] );

	useEffect( () => {
		setIframe( theIframe );
		// rewriting the same src will reload the iframe
		if ( theIframe.src !== src ) {
			theIframe.src = src;
		}
	}, [ src, setIframe ] );

	return <div className="help-center__persistent-iframe-container" ref={ container }></div>;
}

const InlineChat: React.FC = () => {
	const { search } = useLocation();
	const params = new URLSearchParams( search );
	const session = params.get( 'session' ) === 'continued' ? 'continued' : 'new';
	// "ref" is used to track where the user came from so we can show the right message
	// See happychat/getUserInfo for more info.
	const ref = new URLSearchParams( window.location.search ).get( 'ref' ) || '';

	return (
		<PersistentIframe
			src={ `https://widgets.wp.com/calypso-happychat/?session=${ session }&ref=${ ref }&accessTime=${ cacheBuster }` }
		/>
	);
};

export default InlineChat;
