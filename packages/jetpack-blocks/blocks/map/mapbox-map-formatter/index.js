export function mapboxMapFormatter( mapStyle, mapDetails ) {
	const style_urls = {
		default: {
			details: 'mapbox://styles/automattic/cjolkhmez0qdd2ro82dwog1in',
			no_details: 'mapbox://styles/automattic/cjolkci3905d82soef4zlmkdo',
		},
		black_and_white: {
			details: 'mapbox://styles/automattic/cjolkixvv0ty42spgt2k4j434',
			no_details: 'mapbox://styles/automattic/cjolkgc540tvj2spgzzoq37k4',
		},
		satellite: {
			details: 'mapbox://styles/mapbox/satellite-streets-v10',
			no_details: 'mapbox://styles/mapbox/satellite-v9',
		},
		terrain: {
			details: 'mapbox://styles/automattic/cjolkf8p405fh2soet2rdt96b',
			no_details: 'mapbox://styles/automattic/cjolke6fz12ys2rpbpvgl12ha',
		},
	};
	const style_url = style_urls[ mapStyle ][ mapDetails ? 'details' : 'no_details' ];
	return style_url;
}
