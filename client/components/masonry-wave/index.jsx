import './style.scss';
import { useDesktopBreakpoint } from '@automattic/viewport-react';

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
		<img src={ image?.src } alt={ image?.alt ?? 'alt text' } className="masonry-wave__element" />
	);
};

const MasonryWaveColumn = ( props ) => {
	const { images } = props;

	return (
		<div className="masonry-wave__column">
			{ images.map( ( image, index ) => (
				<MasonryWaveElement key={ `masonry-wave__row-${ index }` } image={ image } />
			) ) }
		</div>
	);
};

const MasonryWave = ( props ) => {
	const isDesktop = useDesktopBreakpoint();

	const { numberOfColumns, images } = props;
	const numberOfDesktopColumns = numberOfColumns?.desktop ?? 2;
	const numberOfMobileColumns = numberOfColumns?.mobile ?? numberOfDesktopColumns;
	const amountOfColumns = isDesktop ? numberOfDesktopColumns : numberOfMobileColumns;
	const columns = fillColumnsWithImages( amountOfColumns, images );

	const styles = { '--masonry-wave--amountOfColumns': amountOfColumns };

	return (
		<div className=" masonry-wave__container" style={ styles }>
			{ columns.map( ( col, index ) => (
				<MasonryWaveColumn key={ `masonry-wave__col-${ index }` } images={ col } />
			) ) }
		</div>
	);
};

export default MasonryWave;
