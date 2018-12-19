/** @format */

/**
 * External dependencies
 */
import { __ } from 'gutenberg/extensions/presets/jetpack/utils/i18n';
import classNames from 'classnames';
import { Component, createRef, Fragment } from '@wordpress/element';
import { TextControl } from '@wordpress/components';
import { BlockAlignmentToolbar, BlockControls, RichText } from '@wordpress/editor';
import { debounce } from 'lodash';

/**
 * Internal dependencies
 */
import { settings } from './settings.js';

class GiphyEdit extends Component {
	constructor() {
		super( ...arguments );
		this.state = {
			focus: false,
		};
		this.timer = null;
		this.textControlRef = createRef();
		this.debouncedParseSearch = debounce( this.parseSearch, 250 );
	}
	componentWillUnmount() {
		this.debouncedParseSearch.cancel();
	}
	onSearchTextChange = searchText => {
		const { setAttributes } = this.props;
		setAttributes( { searchText } );
		this.debouncedParseSearch( searchText );
		this.maintainFocus();
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
				this.maintainFocus( 500 );
			} else {
				// Error handling TK
			}
		};
		xhr.send();
	};
	setFocus = () => {
		this.maintainFocus();
		this.textControlRef.current.querySelector( 'input' ).focus();
	};
	maintainFocus = ( timeoutDuration = 3500 ) => {
		this.setState( { focus: true }, () => {
			if ( this.timer ) {
				clearTimeout( this.timer );
			}
			if ( this.hasSearchText() ) {
				this.timer = setTimeout( () => {
					this.setState( { focus: false } );
				}, timeoutDuration );
			}
		} );
	};
	clearFocus = () => {
		this.setState( { focus: false }, () => {
			if ( this.timer ) {
				clearTimeout( this.timer );
			}
		} );
	};
	hasSearchText = () => {
		const { attributes } = this.props;
		const { searchText } = attributes;
		return searchText && searchText.length > 0;
	};
	render() {
		const { attributes, className, isSelected, setAttributes } = this.props;
		const { align, caption, giphyUrl, searchText, topPadding } = attributes;
		const { focus } = this.state;
		const style = {
			paddingTop: `${ topPadding }%`,
		};
		const classes = classNames( className, `align${ align }` );
		const textControlClasses = classNames(
			'wp-block-jetpack-giphy_text-input-field',
			focus || ! this.hasSearchText() ? 'has-focus' : 'no-focus'
		);
		return (
			<Fragment>
				<BlockControls>
					<BlockAlignmentToolbar
						onChange={ value => setAttributes( { align: value } ) }
						value={ align }
					/>
				</BlockControls>
				<div className={ classes }>
					<figure style={ style }>
						<button
							className="wp-block-jetpack-giphy_cover"
							onClick={ this.setFocus }
							ref={ this.textControlRef }
							tabIndex="0"
						>
							{ ( ! searchText || isSelected ) && (
								<TextControl
									className={ textControlClasses }
									label={ __( 'Search or paste a Giphy URL' ) }
									placeholder={ __( 'Search or paste a Giphy URL' ) }
									onChange={ this.onSearchTextChange }
									onClick={ this.maintainFocus }
									value={ searchText }
								/>
							) }
						</button>
						<iframe src={ giphyUrl } title={ searchText } />
					</figure>
					{ ( ! RichText.isEmpty( caption ) || isSelected ) && (
						<RichText
							className="caption"
							inlineToolbar
							onChange={ value => setAttributes( { caption: value } ) }
							placeholder={ __( 'Write caption…' ) }
							tagName="figcaption"
							value={ caption }
						/>
					) }
				</div>
			</Fragment>
		);
	}
}
export default GiphyEdit;
