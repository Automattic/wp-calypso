import { addQueryArgs } from '@wordpress/url';
import { cloneElement, ReactElement, useEffect, useState } from 'react';

// Same ratio as in the CSS transform in .pattern-selector__block-list iframe
const iframeScaleRatio = 0.268;
const initialHeight = 140;
const verticalPaddingValue = 10;

const PatternPreviewAutoHeight = ( {
	children,
	url,
	patternName,
	patternId,
	isShown,
}: {
	children: ReactElement;
	url: string;
	patternName: string;
	patternId: number;
	isShown: boolean;
} ) => {
	const [ height, setHeight ] = useState( initialHeight );
	const [ isLoaded, setIsLoaded ] = useState( false );
	const calypso_token = patternId;
	const verticalPadding = height < initialHeight ? verticalPaddingValue : 0;

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
				setIsLoaded( true );
			}
		};

		window.addEventListener( 'message', handleMessage );

		return () => window.removeEventListener( 'message', handleMessage );
	}, [ calypso_token ] );

	const wrapper = cloneElement(
		children,
		{
			style: {
				minHeight: Math.round( height * iframeScaleRatio ) + verticalPadding,
			},
		},
		isShown && isLoaded ? null : <div className="pattern-list__pattern-placeholder" />,
		<iframe
			title={ patternName }
			frameBorder="0"
			aria-hidden
			tabIndex={ -1 }
			style={ {
				// The extra 2px are required to avoid the scrollbars on some patterns
				height: height + 2,
				top: verticalPadding / 2,
			} }
			src={ addQueryArgs( url, { calypso_token } ) }
		/>
	);

	return wrapper;
};

export default PatternPreviewAutoHeight;
