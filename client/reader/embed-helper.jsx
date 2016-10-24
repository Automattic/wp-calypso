import percentageFactory from 'percentage-regex';

const percentageRegex = percentageFactory( { exact: true } );
const isPercentage = ( val ) => percentageRegex.test( val );

var embedsConfig = {
	'default': {
		sizingFunction: function defaultEmbedSizingFunction( embed, availableWidth ) {
			let { aspectRatio, width, height } = embed;

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
				height: `${ height | 0 }px`
			};
		}
	},
	spotify: {
		sizingFunction: function spotifyEmbedSizingFunction( embed, availableWidth ) {
			var height;

			// Spotify can handle maximum height of : width + 80, if our resulted height
			// from aspectRatio calculation will be larger, we'll use availableWidth + 80
			if ( embed.aspectRatio ) {
				height = Math.min( availableWidth / embed.aspectRatio, availableWidth + 80 );
			} else {
				height = availableWidth + 80;
			}

			return {
				width: availableWidth + 'px',
				height: height + 'px'
			};
		},
		urlRegex: /\/\/embed.spotify.com/
	},
	soundcloud: {
		sizingFunction: function soundcloudEmbedSizingFunction( embed, availableWidth ) {
			var aspectRatio = embed.aspectRatio || 1,
				height = '100%';

			if ( embed.iframe.indexOf( 'visual=true' ) > -1 ) {
				height = Math.floor( availableWidth / aspectRatio ) + 'px';
			}

			return {
				width: availableWidth + 'px',
				height: height
			};
		},
		urlRegex: /\/\/w\.soundcloud\.com\/player/
	},
};

function extractUrlFromIframe( iframeHtml ) {
	var urlRegex = new RegExp( 'src="([^"]+)"' ),
		res = urlRegex.exec( iframeHtml );

	return res.length > 1 ? res[ 1 ] : null;
}

function resolveEmbedConfig( embed ) {
	var embedType,
		url;

	// if there's type, easiest way just to use it
	if ( embedsConfig.hasOwnProperty( embed.type ) ) {
		return embedsConfig[ embed.type ];
	}

	// if no type, check everyone by their url regex
	url = extractUrlFromIframe( embed.iframe );

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

module.exports = {
	getEmbedSizingFunction: function getEmbedSizingFunction( embed ) {
		var embedConfig = resolveEmbedConfig( embed );

		return embedConfig.sizingFunction.bind( embedConfig, embed );
	}
};
