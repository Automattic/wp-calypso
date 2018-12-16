/** @format */

/**
 * External dependencies
 */
import { __ } from 'gutenberg/extensions/presets/jetpack/utils/i18n';
import classNames from 'classnames';
import { Component, Fragment } from '@wordpress/element';
import { TextControl } from '@wordpress/components';
import {
	BlockAlignmentToolbar,
	BlockControls,
	InspectorControls,
	RichText,
} from '@wordpress/editor';
import { debounce } from 'lodash';

/**
 * Internal dependencies
 */
import { settings } from './settings.js';

class GiphyEdit extends Component {
	constructor() {
		super( ...arguments );
		this.debouncedParseSearch = debounce( this.parseSearch, 250 );
	}
	componentWillUnmount() {
		this.debouncedParseSearch.cancel();
	}
	onSearchTextChange = searchText => {
		const { setAttributes } = this.props;
		setAttributes( { searchText } );
		this.debouncedParseSearch( searchText );
	};
	parseSearch = searchText => {
		// If search is hardcoded Giphy URL following this pattern: https://giphy.com/embed/4ZFekt94LMhNK
		if ( searchText.indexOf( '//giphy.com/gifs' ) !== -1 ) {
			const giphyId = this.splitAndLast( this.splitAndLast( searchText, '/' ), '-' );
			return this.fetch( this.urlForId( giphyId ) );
		}
		// If search is hardcoded Giphy URL following this patterh: http://i.giphy.com/4ZFekt94LMhNK.gif
		if ( searchText.indexOf( '//i.giphy.com' ) !== -1 ) {
			const giphyId = this.splitAndLast( searchText, '/' ).replace( '.gif', '' );
			return this.fetch( this.urlForId( giphyId ) );
		}
		// Otherwise, treat it as a search
		return this.fetch( this.urlForSearch( searchText ) );
	};
	urlForSearch = searchText => {
		const { apiKey } = settings;
		const encoded = searchText.replace( ' ', '+' );
		return `//api.giphy.com/v1/gifs/search?q=${ encoded }&api_key=${ apiKey }&limit=1&offset=0`;
	};
	urlForId = giphyId => {
		const { apiKey } = settings;
		return `//api.giphy.com/v1/gifs/${ giphyId }?api_key=${ apiKey }&limit=1&offset=0`;
	};
	splitAndLast = ( array, delimiter ) => {
		const split = array.split( delimiter );
		return split[ split.length - 1 ];
	};
	fetch = url => {
		const { setAttributes } = this.props;
		const xhr = new XMLHttpRequest();
		xhr.open( 'GET', url );
		xhr.onload = () => {
			if ( xhr.status === 200 ) {
				const res = JSON.parse( xhr.responseText );
				const giphyData = res.data.length > 0 ? res.data[ 0 ] : res.data;
				// No results
				if ( ! giphyData.images ) {
					return;
				}
				const topPadding =
					( giphyData.images.original.height / giphyData.images.original.width ) * 100;
				const giphyUrl = giphyData.embed_url;
				setAttributes( { giphyUrl, topPadding } );
			} else {
				// Error handling TK
			}
		};
		xhr.send();
	};
	render() {
		const { attributes, className, setAttributes } = this.props;
		const { align, caption, giphyUrl, searchText, topPadding } = attributes;
		const style = {
			paddingTop: `${ topPadding }%`,
		};
		const classes = classNames( className, `align${ align }` );
		return (
			<Fragment>
				<BlockControls>
					<BlockAlignmentToolbar
						controls={ settings.validAlignments }
						onChange={ value => setAttributes( { align: value } ) }
						value={ align }
					/>
				</BlockControls>
				<InspectorControls>
					<TextControl
						label={ __( 'Search or paste a Giphy URL' ) }
						onChange={ this.onSearchTextChange }
						value={ searchText }
					/>
				</InspectorControls>
				<div className={ classes }>
					<figure style={ style }>
						<div className="wp-block-jetpack-giphy_cover" />
						<iframe src={ giphyUrl } title={ searchText } />
						<figcaption className="wp-block-jetpack-giphy_logo">Powered by Giphy</figcaption>
					</figure>
					<RichText
						className="caption"
						inlineToolbar
						onChange={ value => setAttributes( { caption: value } ) }
						placeholder={ __( 'Write caption…' ) }
						tagName="figcaption"
						value={ caption }
					/>
				</div>
			</Fragment>
		);
	}
}
export default GiphyEdit;
