/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';

/**
 * Internal dependencies
 */
import shortcodeUtils from 'lib/shortcode';
import MediaActions from 'lib/media/actions';
import MediaListStore from 'lib/media/list-store';
import WpVideoView from './wpvideo-view';

const getStateData = siteId => {
	return {
		media: MediaListStore.getAll( siteId ),
		mediaHasNextPage: MediaListStore.hasNextPage( siteId ),
		mediaFetchingNextPage: MediaListStore.isFetchingNextPage( siteId )
	};
};

class WpVideoViewContainer extends Component {

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
		setTimeout( () => {
			MediaActions.setQuery( siteId, { mime_type: 'video/' } );
			MediaActions.fetchNextPage( siteId )
		}, 0 );
	}

	updateStateData() {
		this.setState( getStateData( this.props.siteId ) );
		if ( ! this.state.mediaFetchingNextPage && this.state.mediaHasNextPage ) {
			this.fetchData( this.props.siteId );
		}
	}

	render() {
		return <WpVideoView media={ this.state.media } content={ this.props.content } />;
	}

}

WpVideoViewContainer.propTypes = {
	siteId: PropTypes.number,
	content: PropTypes.string
};

export default WpVideoViewContainer;
