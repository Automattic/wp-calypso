/**
 * External dependencies
 */
import percentageFactory from 'percentage-regex';

const percentageRegex = percentageFactory( { exact: true } );
const isPercentage = ( val ) => percentageRegex.test( val );

const embedsConfig = {
	default: {
		sizingFunction: function defaultEmbedSizingFunction( embed, availableWidth ) {
			const { aspectRatio } = embed;
			let { width, height } = embed;

			if ( ! isNaN( aspectRatio ) ) {
				// width and height were numbers, so grab the aspect ratio
				// and scale to the `availableWidth`
				width = availableWidth;
				height = availableWidth / aspectRatio;
			}
			if ( isPercentage( width ) ) {
				// if `width` is a percentage, then scale based on `availableWidth`
				width = availableWidth * ( parseInt( width, 10 ) / 100 );
			}
			if ( isPercentage( height ) ) {
				// if `height` is a percentage, then scale based on the calculated `width`
				height = width * ( parseInt( height, 10 ) / 100 );
			}
			return {
				width: `${ width | 0 }px`,
				height: `${ height | 0 }px`,
				paddingRight: '1px', // this exists to solve a bug in safari that we found here: https://github.com/Automattic/wp-calypso/issues/8987
			};
		},
	},
	spotify: {
		sizingFunction: function spotifyEmbedSizingFunction( embed, availableWidth ) {
			let height;

			// Spotify can handle maximum height of : width + 80, if our resulted height
			// from aspectRatio calculation will be larger, we'll use availableWidth + 80
			if ( embed.aspectRatio ) {
				height = Math.min( availableWidth / embed.aspectRatio, availableWidth + 80 );
			} else {
				height = availableWidth + 80;
			}

			return {
				width: availableWidth + 'px',
				height: height + 'px',
			};
		},
		urlRegex: /\/\/embed.spotify.com/,
	},
	soundcloud: {
		sizingFunction: function soundcloudEmbedSizingFunction( embed, availableWidth ) {
			const aspectRatio = embed.aspectRatio || 1;
			let height = '100%';

			if ( embed.iframe.indexOf( 'visual=true' ) > -1 ) {
				height = Math.floor( availableWidth / aspectRatio ) + 'px';
			}

			return {
				width: availableWidth + 'px',
				height: height,
			};
		},
		urlRegex: /\/\/w\.soundcloud\.com\/player/,
	},
};

function extractUrlFromIframe( iframeHtml ) {
	const urlRegex = new RegExp( 'src="([^"]+)"' ),
		res = urlRegex.exec( iframeHtml );

	return res.length > 1 ? res[ 1 ] : null;
}

function resolveEmbedConfig( embed ) {
	let embedType;

	// if there's type, easiest way just to use it
	if ( embedsConfig.hasOwnProperty( embed.type ) ) {
		return embedsConfig[ embed.type ];
	}

	// if no type, check everyone by their url regex
	const url = extractUrlFromIframe( embed.iframe );

	if ( url ) {
		for ( embedType in embedsConfig ) {
			if ( embedsConfig.hasOwnProperty( embedType ) && embedsConfig[ embedType ].urlRegex ) {
				if ( url.match( embedsConfig[ embedType ].urlRegex ) ) {
					return embedsConfig[ embedType ];
				}
			}
		}
	}

	return embedsConfig.default;
}

const exported = {
	getEmbedSizingFunction: function getEmbedSizingFunction( embed ) {
		const embedConfig = resolveEmbedConfig( embed );

		return embedConfig.sizingFunction.bind( embedConfig, embed );
	},
};

export default exported;

export const { getEmbedSizingFunction } = exported;
