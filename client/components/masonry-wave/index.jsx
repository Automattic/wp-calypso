import './style.scss';

import { useState, useEffect } from 'react';

function getWindowDimensions() {
	const { innerWidth: width, innerHeight: height } = window;
	return {
		width,
		height,
	};
}

function useWindowDimensions() {
	const [ windowDimensions, setWindowDimensions ] = useState( getWindowDimensions() );

	useEffect( () => {
		function handleResize() {
			setWindowDimensions( getWindowDimensions() );
		}

		window.addEventListener( 'resize', handleResize );
		return () => window.removeEventListener( 'resize', handleResize );
	}, [] );

	return windowDimensions;
}

// fills the columns with images LTR to imitate the CSS grid behavior
const fillColumnsWithImages = ( amountOfColumns, images ) => {
	const columns = Array( amountOfColumns );
	let columnIndex = 0;

	images.forEach( ( image ) => {
		if ( columnIndex === amountOfColumns ) {
			columnIndex = 0;
		}

		if ( ! columns[ columnIndex ] ) {
			columns[ columnIndex ] = [];
		}

		columns[ columnIndex ].push( image );

		columnIndex++;
	} );

	return columns;
};

const MasonryWaveElement = ( props ) => {
	const { image } = props;

	return (
		<div className="masonry-wave__element">
			<img src={ image?.src } alt={ image?.alt ?? 'alt text' } />
		</div>
	);
};

const MasonryWaveColumn = ( props ) => {
	const { images } = props;

	return (
		<div className="masonry-wave__column">
			{ images.map( ( image ) => (
				<MasonryWaveElement image={ image } />
			) ) }
		</div>
	);
};

const MasonryWave = ( props ) => {
	const { width } = useWindowDimensions();

	const isDesktop = width >= 480; // should probably do this better?
	const { numberOfColumns, images } = props;
	const numberOfDesktopColumns = numberOfColumns?.desktop ?? 2;
	const numberOfMobileColumns = numberOfColumns?.mobile ?? numberOfDesktopColumns;
	const amountOfColumns = isDesktop ? numberOfDesktopColumns : numberOfMobileColumns;
	const columns = fillColumnsWithImages( amountOfColumns, images );

	const styles = { '--masonry-wave--amountOfColumns': amountOfColumns };

	return (
		<div className=" masonry-wave__container" style={ styles }>
			{ columns.map( ( col ) => (
				<MasonryWaveColumn images={ col } />
			) ) }
		</div>
	);
};

export default MasonryWave;
