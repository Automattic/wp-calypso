/** @format */

export const squareLayout = options => {
	const { columns, margin, maxWidth, images } = options;

	const imagesPerRow = columns > 1 ? columns : 1;

	const marginSpace = imagesPerRow * margin * 2;
	const size = Math.floor( ( maxWidth - marginSpace ) / imagesPerRow );
	let remainderSize = size;
	let imgSize = remainderSize;
	const remainder = images.length % imagesPerRow;
	let remainderSpace = 0;
	if ( remainder > 0 ) {
		remainderSpace = remainder * margin * 2;
		remainderSize = Math.floor( ( maxWidth - remainderSpace ) / remainder );
	}

	let c = 1;
	let itemsInRow = 0;
	const rows = [];
	let row = {
		images: [],
	};
	for ( const image of images ) {
		if ( remainder > 0 && c <= remainder ) {
			imgSize = remainderSize;
		} else {
			imgSize = size;
		}

		image.width = image.height = imgSize;

		row.images.push( image );
		c++;
		itemsInRow++;

		if ( imagesPerRow === itemsInRow || remainder + 1 === c ) {
			rows.push( row );
			itemsInRow = 0;

			row.height = imgSize + margin * 2;
			row.width = maxWidth;
			row.groupSize = imgSize + 2 * margin;

			row = {
				images: [],
			};
		}
	}

	if ( row.images.length > 0 ) {
		row.height = imgSize + margin * 2;
		row.width = maxWidth;
		row.groupSize = imgSize + 2 * margin;

		rows.push( row );
	}

	return rows;
};

// @TODO
export const rectangularLayout = options => squareLayout( options );
export const circleLayout = options => squareLayout( options );
export const columnsLayout = options => squareLayout( options );
