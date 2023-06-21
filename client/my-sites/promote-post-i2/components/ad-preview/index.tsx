import { useEffect, useRef } from 'react';
import './style.scss';

interface Props {
	htmlCode: string;
	isLoading?: boolean;
}

export default function AdPreview( { htmlCode, isLoading }: Props ) {
	const shadowHost = useRef< HTMLDivElement >( null );

	useEffect( () => {
		if ( ! isLoading && htmlCode && shadowHost.current ) {
			const shadowRoot = shadowHost.current.attachShadow( { mode: 'open' } );
			shadowRoot.innerHTML = `
          <div class="viewer viewer__receipt}">
            ${ htmlCode }
          </div>`;
		}
	}, [ isLoading ] );

	if ( isLoading ) {
		return <div className="promote-post-ad-preview__loading" />;
	}

	return (
		<div>
			<div ref={ shadowHost } />
		</div>
	);
}
