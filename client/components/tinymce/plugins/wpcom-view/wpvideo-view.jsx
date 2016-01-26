/**
 * External dependencies
 */
import React, { Component } from 'react';
import defaults from 'lodash/object/defaults';
import omitBy from 'lodash/omitBy';
import find from 'lodash/collection/find';
import QueryString from 'querystring' ;

/**
 * Internal dependencies
 */
import shortcodeUtils from 'lib/shortcode';
import MediaActions from 'lib/media/actions';
import MediaListStore from 'lib/media/list-store';
import MediaUtils from 'lib/media/utils';

const getStateData = siteId => {
	return {
		media: MediaListStore.getAll( siteId ),
		mediaHasNextPage: MediaListStore.hasNextPage( siteId ),
		mediaFetchingNextPage: MediaListStore.isFetchingNextPage( siteId )
	};
};

class WpVideoView extends Component {

	static match( content ) {
		const match = shortcodeUtils.next( 'wpvideo', content );

		if ( match ) {
			return {
				index: match.index,
				content: match.content,
				options: {
					shortcode: match.shortcode
				}
			};
		}
	}

	static serialize( content ) {
		return encodeURIComponent( content );
	}

	constructor( props ) {
		super( props );
		this.state = getStateData( props.siteId );
	}

	componentDidMount() {
		MediaListStore.on( 'change', this.updateStateData.bind( this ) );
		this.fetchData( this.props.siteId );
	}

	componentWillUnmount() {
		MediaListStore.off( 'change', this.updateStateData.bind( this ) );
	}

	componentWillReceiveProps( nextProps ) {
		if ( this.props.siteId !== nextProps.siteId ) {
			this.fetchData( this.props.siteId );
			this.updateStateData();
		}
	}

	fetchData( siteId ) {
		if ( MediaListStore.getAll( siteId ) ) {
			return;
		}

		setTimeout( () => {
			MediaActions.setQuery( siteId, { mime_type: 'video/' } );
			MediaActions.fetchNextPage( siteId )
		}, 0 );
	}

	updateStateData() {
		this.setState( getStateData( this.props.siteId ) );
	}

	getVideoAttributes( videopress_guid ) {
		if ( this.state.media ) {
			return find( this.state.media, item => MediaUtils.isVideoPressItem( item ) && item.videopress_guid === videopress_guid );
		}
	}

	getShortCodeAttributes() {
		const shortcode = shortcodeUtils.parse( this.props.content );
		const namedAttrs = shortcode.attrs.named;
		const videopress_guid = shortcode.attrs.numeric[0];

		const defaultWidth = 640;
		const defaultHeight = defaultWidth * 9 / 16;

		const videoAttributes = this.getVideoAttributes( shortcode.attrs.numeric[0] ) || {};

		return defaults( {
			videopress_guid,
			w: parseInt( namedAttrs.w, 10 ) || videoAttributes.width,
			h: parseInt( namedAttrs.h, 10 ) || videoAttributes.height,
			autoplay: namedAttrs.autoplay === 'true',
			hd: namedAttrs.hd === 'true',
			loop: namedAttrs.loop === 'true',
			at: parseInt( namedAttrs.at, 10 ) || undefined,
			defaultLangCode: namedAttrs.defaultlangcode
		}, {
			w: defaultWidth,
			h: defaultHeight,
			at: 0,
			defaultLangCode: false
		} );
	}

	getEmbedUrl( attrs ) {
		const queryString = QueryString.stringify( omitBy( attrs, ['videopress_guid', 'w', 'h'] ) );

		return `https://videopress.com/embed/${ attrs.videopress_guid }?${ queryString }`;
	}

	render() {
		const attrs = this.getShortCodeAttributes();

		return (
			<div className="wpview-content">
				<iframe
					width = { attrs.w }
					height = { attrs.h }
					src={ this.getEmbedUrl( attrs ) }
					frameBorder="0"
					allowFullScreen />
			</div>
		);
	}

}

export default WpVideoView;
