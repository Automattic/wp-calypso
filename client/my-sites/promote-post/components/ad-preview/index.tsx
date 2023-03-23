import { useEffect, useRef } from 'react';

interface Props {
	htmlCode: string;
}
export default function AdPreview( { htmlCode }: Props ) {
	const shadowHost = useRef< HTMLDivElement >( null );

	useEffect( () => {
		if ( htmlCode && shadowHost.current ) {
			const shadowRoot = shadowHost.current.attachShadow( { mode: 'open' } );
			shadowRoot.innerHTML = `
          <div class="viewer viewer--receipt}">
            ${ htmlCode }
          </div>`;
		}
	}, [] );

	return (
		<div>
			<div ref={ shadowHost } />
		</div>
	);
}
