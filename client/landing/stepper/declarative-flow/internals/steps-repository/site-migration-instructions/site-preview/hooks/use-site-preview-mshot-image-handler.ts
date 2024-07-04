import { useState } from '@wordpress/element';

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

export const useSitePreviewMShotImageHandler = () => {
	const [ mShotsOption, setMShotsOption ] = useState< MShotConfig | undefined >( undefined );
	const [ currentSegment, setCurrentSegment ] = useState( '' );

	const callMShotEndpoint = ( url: string ) => {
		fetch( url, { method: 'GET' } );
	};

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

	const createScreenshots = ( url: string ) => {
		Object.entries( mShotConfigs ).forEach( ( mShotParams ) => {
			callMShotEndpoint(
				`https://s0.wp.com/mshots/v1/${ encodeURIComponent( url ) }?${ Object.entries(
					mShotParams[ 1 ]
				)
					.filter( ( entry ) => !! entry[ 1 ] )
					.map( ( [ key, val ] ) => key + '=' + val )
					.join( '&' ) }`
			);
		} );
	};

	return { createScreenshots, getSegment, mShotsOption, updateDimensions, currentSegment };
};
