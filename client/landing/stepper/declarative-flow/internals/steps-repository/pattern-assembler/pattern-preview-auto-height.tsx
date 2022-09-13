import { addQueryArgs } from '@wordpress/url';
import { cloneElement, ReactElement, useEffect, useState } from 'react';

// Same ratio as in the CSS transform in .pattern-selector__block-list iframe
const iframeScaleRatio = 0.2705;

const PatternPreviewAutoHeight = ( {
	children,
	url,
	patternName,
	patternId,
}: {
	children: ReactElement;
	url: string;
	patternName: string;
	patternId: number;
} ) => {
	const [ height, setHeight ] = useState( 300 );
	const calypso_token = patternId;

	useEffect( () => {
		const handleMessage = ( event: MessageEvent ) => {
			let data;
			try {
				data = JSON.parse( event.data );
			} catch ( err ) {
				return;
			}

			if ( ! data || data.channel !== 'preview-' + calypso_token ) {
				return;
			}

			if ( 'page-dimensions-on-load' === data.type ) {
				setHeight( data.payload.height );
			}
		};

		window.addEventListener( 'message', handleMessage );

		return () => window.removeEventListener( 'message', handleMessage );
	}, [ calypso_token ] );

	const wrapper = cloneElement(
		children,
		{ style: { minHeight: height * iframeScaleRatio } },
		<iframe
			title={ patternName }
			frameBorder="0"
			aria-hidden
			tabIndex={ -1 }
			style={ { height } }
			src={ addQueryArgs( url, { calypso_token } ) }
		/>
	);

	return wrapper;
};

export default PatternPreviewAutoHeight;
