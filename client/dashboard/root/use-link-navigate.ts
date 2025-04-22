import { useRouter } from '@tanstack/react-router';
import { useEffect } from 'react';
import { useAppContext } from '../app/context';

export function useLinkNavigate() {
	const { basePath } = useAppContext();
	const router = useRouter();
	useEffect( () => {
		function onClick( event: MouseEvent ) {
			// Allow the user to open in new tab, new window, etc.
			if ( event.metaKey || event.altKey || event.ctrlKey || event.shiftKey ) {
				return;
			}
			if ( ! event.target ) {
				return;
			}
			const target = ( event.target as HTMLElement ).closest( 'a' );
			if ( ! target ) {
				return;
			}
			const targetUrl = new URL( target.href );
			if ( targetUrl.origin !== window.origin ) {
				return;
			}
			if ( ! targetUrl.pathname.startsWith( basePath ) ) {
				return;
			}
			const to = targetUrl.pathname.slice( basePath.length );
			router.navigate( { to } );
			event.preventDefault();
		}
		window.addEventListener( 'click', onClick );
		return () => {
			window.removeEventListener( 'click', onClick );
		};
	}, [ basePath, router ] );
}
