import config from '@automattic/calypso-config';
import { useEffect, useRef, useState } from '@wordpress/element';
import { throttle } from 'lodash';

interface MShotConfig {
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

export const useSitePreviewMShotImageHandler = ( url: string = '' ) => {
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

	const updateDimensions = ( previewRef: React.RefObject< HTMLDivElement > ) => {
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
		if ( ! previewRef?.current ) {
			return;
		}
		updateDimensions( previewRef );
		const throttledResizeHandler = throttle( () => updateDimensions( previewRef ), 200 );

		window.addEventListener( 'resize', throttledResizeHandler );
		return () => window.removeEventListener( 'resize', throttledResizeHandler );
	}, [ previewRef ] );

	const createScreenshots = ( url: string ) => {
		const isEnabled = config.isEnabled( 'migration-flow/new-migration-instructions-step' );

		if ( ! isEnabled ) {
			return;
		}

		Object.entries( mShotConfigs ).forEach( ( mShotParams ) => {
			const screenShotUrl = `https://s0.wp.com/mshots/v1/${ encodeURIComponent(
				url
			) }?${ Object.entries( mShotParams[ 1 ] )
				.filter( ( entry ) => !! entry[ 1 ] )
				.map( ( [ key, val ] ) => key + '=' + val )
				.join( '&' ) }`;

			sendScreenshotRequest( screenShotUrl );
		} );
	};

	useEffect( () => {
		if ( url ) {
			// In case the screenshots were not created before (for example, the site-identify step), we send a request
			// generate all the responsive screenshots. Otherwise if the user resizes the window to check the responsiveness,
			// it will take a long loading time each time.
			createScreenshots( url );
		}
	}, [ url ] );

	return {
		createScreenshots,
		getSegment,
		mShotsOption,
		updateDimensions,
		currentSegment,
		previewRef,
	};
};
