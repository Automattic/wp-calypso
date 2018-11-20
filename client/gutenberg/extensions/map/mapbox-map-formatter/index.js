/** @format */

/* TODO: Replace with styles created in A8C-owned account */
export function mapboxMapFormatter( mapStyle, mapDetails ) {
	const style_urls = {
		default: {
			details: 'mapbox://styles/rabberson/cjnxjme2m054v2rs2gf3nggx6',
			no_details: 'mapbox://styles/rabberson/cjnxl6xqp55kt2sk55ivay8r0',
		},
		black_and_white: {
			details: 'mapbox://styles/rabberson/cjnxjofik08ax2rmx47rfzhji',
			no_details: 'mapbox://styles/rabberson/cjnxjvlk108kq2slmjnd9beni',
		},
		satellite: {
			details: 'mapbox://styles/mapbox/satellite-streets-v10',
			no_details: 'mapbox://styles/mapbox/satellite-v9',
		},
		terrain: {
			details: 'mapbox://styles/rabberson/cjnxl0upd52ik2srtr0zh216f',
			no_details: 'mapbox://styles/rabberson/cjnxl28cc54rl2roaamgb621y',
		},
	};
	const style_url = style_urls[ mapStyle ][ mapDetails ? 'details' : 'no_details' ];
	return style_url;
}
