/** @format */

export default ( columns, images ) => {
	const content_width = 520; // Core has some examples how to get this from the container...

	const images_per_row = columns > 1 ? columns : 1;
	const margin = 2;

	const margin_space = images_per_row * margin * 2;
	const size = Math.floor( ( content_width - margin_space ) / images_per_row );
	let remainder_size = size;
	let img_size = remainder_size;
	const remainder = images.length % images_per_row;
	let remainder_space = 0;
	if ( remainder > 0 ) {
		remainder_space = remainder * margin * 2;
		remainder_size = Math.floor( ( content_width - remainder_space ) / remainder );
	}

	let c = 1;
	let items_in_row = 0;
	const rows = [];
	let row = {
		images: [],
	};
	for ( const image of images ) {
		if ( remainder > 0 && c <= remainder ) {
			img_size = remainder_size;
		} else {
			img_size = size;
		}

		image.width = image.height = img_size;

		row.images.push( image );
		c++;
		items_in_row++;

		if ( images_per_row === items_in_row || remainder + 1 === c ) {
			rows.push( row );
			items_in_row = 0;

			row.height = img_size + margin * 2;
			row.width = content_width;
			row.group_size = img_size + 2 * margin;

			row = {
				images: [],
			};
		}
	}

	if ( row.images.length > 0 ) {
		row.height = img_size + margin * 2;
		row.width = content_width;
		row.group_size = img_size + 2 * margin;

		rows.push( row );
	}

	// eslint-disable-next-line
	// console.log('rows:', rows);

	return rows;
};
