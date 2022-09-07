import { cloneElement, ReactElement, useEffect, useState } from 'react';
import { publicApiUrl } from './utils';

// Same ratio as in the CSS transform in .pattern-selector__block-list iframe
const iframeScaleRatio = 0.2705;

const IframeAutoHeight = ( {
	children,
	patternId,
}: {
	children: ReactElement;
	patternId: number;
} ) => {
	const [ height, setHeight ] = useState( 300 );

	useEffect( () => {
		const handleMessage = ( { data, origin }: MessageEvent ) => {
			if (
				publicApiUrl === origin &&
				'preview-auto-height' === data?.source &&
				patternId === data?.patternId
			) {
				setHeight( data.height );
			}
		};

		window.addEventListener( 'message', handleMessage );

		return () => window.removeEventListener( 'message', handleMessage );
	}, [ patternId ] );

	const iframe = cloneElement( children.props.children, { style: { height } } );
	const wrapper = cloneElement(
		children,
		{ style: { minHeight: height * iframeScaleRatio } },
		iframe
	);

	return wrapper;
};

export default IframeAutoHeight;
