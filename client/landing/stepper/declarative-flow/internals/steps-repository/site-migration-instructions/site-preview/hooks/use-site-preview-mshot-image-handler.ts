import { throttle } from '@wordpress/compose';
import { useCallback, useEffect, useRef, useState } from '@wordpress/element';

export interface MShotConfig {
	vpw: number;
	vph: number;
	w: number;
	h: number;
	screen_height: number;
	scale: number;
}

const mShotConfigs: Record< string, MShotConfig > = {
	desktop: {
		vpw: 1600,
		vph: 1600,
		w: 1600,
		h: 1624,
		screen_height: 1600,
		scale: 2,
	},
	tablet: {
		vpw: 767,
		vph: 1600,
		w: 767,
		h: 1600,
		screen_height: 1600,
		scale: 2,
	},
	mobile: {
		vpw: 479,
		vph: 1200,
		w: 479,
		h: 1200,
		screen_height: 1200,
		scale: 2,
	},
};

const sendScreenshotRequest = ( screenShotUrl: string ) => {
	const http = new XMLHttpRequest();
	http.open( 'GET', screenShotUrl );
	http.send();
};

export const useSitePreviewMShotImageHandler = ( url: string = '', options?: MShotConfig ) => {
	const [ mShotsOption, setMShotsOption ] = useState< MShotConfig | undefined >( undefined );
	const [ currentSegment, setCurrentSegment ] = useState( '' );

	const getSegment = ( width: number ) => {
		switch ( true ) {
			case width >= 1024:
				return 'desktop';
			case width >= 600:
				return 'tablet';
			default:
				return 'mobile';
		}
	};

	const previewRef = useRef< HTMLDivElement >( null );

	const updateDimensions = ( previewRef: React.RefObject< HTMLDivElement | null > ) => {
		if ( previewRef.current ) {
			const { offsetWidth } = previewRef.current;
			const width = Math.min( offsetWidth, 1920 );

			const newSegment = getSegment( width );

			if ( currentSegment === newSegment ) {
				return;
			}

			setMShotsOption( mShotConfigs[ newSegment ] );
			setCurrentSegment( newSegment );
		}
	};

	useEffect( () => {
		if ( options || ! previewRef?.current ) {
			return;
		}
		updateDimensions( previewRef );
		const throttledResizeHandler = throttle( () => updateDimensions( previewRef ), 200 );

		window.addEventListener( 'resize', throttledResizeHandler );
		return () => window.removeEventListener( 'resize', throttledResizeHandler );
	}, [ previewRef, options ] );

	const createScreenshots = useCallback(
		( url: string ) => {
			const configs = options ? [ options ] : Object.values( mShotConfigs );
			configs.forEach( ( config ) => {
				const screenShotUrl = `https://s0.wp.com/mshots/v1/${ encodeURIComponent(
					url
				) }?${ Object.entries( config )
					.filter( ( entry ) => !! entry[ 1 ] )
					.map( ( [ key, val ] ) => key + '=' + val )
					.join( '&' ) }`;

				sendScreenshotRequest( screenShotUrl );
			} );
		},
		[ options ]
	);

	useEffect( () => {
		if ( url ) {
			// Prewarm captures so resizing does not wait for screenshot generation.
			createScreenshots( url );
		}
	}, [ url, createScreenshots ] );

	return {
		createScreenshots,
		getSegment,
		mShotsOption: options ?? mShotsOption,
		updateDimensions,
		currentSegment,
		previewRef,
	};
};
