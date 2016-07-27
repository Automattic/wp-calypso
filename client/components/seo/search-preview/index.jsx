/** @ssr-ready **/

/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import PureRenderMixin from 'react-pure-render/mixin';
import find from 'lodash/find';

const TITLE_LENGTH = 63;
const SNIPPET_LENGTH = 160;

const shortEnough = limit => title => title.length <= limit ? title : false;

const truncatedAtSpace = ( lower, upper ) => fullTitle => {
	const title = fullTitle.slice( 0, upper );
	const lastSpace = title.lastIndexOf( ' ' );

	return ( lastSpace > lower && lastSpace < upper )
		? title.slice( 0, lastSpace ).concat( '…' )
		: false;
};

const hardTruncation = limit => title => title.slice( 0, limit ).concat( '…' );

const firstValid = ( ...predicates ) => a =>
	find( predicates, ( p => false !== p( a ) ) )( a );

const googleTitle = firstValid(
	shortEnough( TITLE_LENGTH ),
	truncatedAtSpace( TITLE_LENGTH - 40, TITLE_LENGTH + 10 ),
	hardTruncation( TITLE_LENGTH )
);

const googleSnippet = firstValid(
	shortEnough( SNIPPET_LENGTH ),
	truncatedAtSpace( SNIPPET_LENGTH - 80, SNIPPET_LENGTH + 10 ),
	hardTruncation( SNIPPET_LENGTH )
);

export const SearchPreview = React.createClass( {
	mixins: [ PureRenderMixin ],

	render() {
		const {
			snippet,
			title,
			url
		} = this.props;

		return (
			<div className="seo-search-preview">
				<h2 className="seo-search-preview__header">{ this.translate( 'Search Preview' ) }</h2>
				<div className="seo-search-preview__display">
					<div className="seo-search-preview__title">
						{ googleTitle( title ) }
					</div>
					<div className="seo-search-preview__url">
						{ url } ▾
					</div>
					<div className="seo-search-preview__snippet">
						{ googleSnippet( snippet || '' ) }
					</div>
				</div>
			</div>
		);
	}
} );

SearchPreview.propTypes = {
	title: PropTypes.string,
	url: PropTypes.string,
	snippet: PropTypes.string
};

SearchPreview.defaultProps = {
	title: '',
	url: '',
	snippet: ''
};

export default SearchPreview;
