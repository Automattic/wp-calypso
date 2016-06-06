import React, { PropTypes } from 'react';
import toString from 'lodash/toString';

const reactifyNewlines = message =>
	message
		.split( '\n' )
		.map( ( snip, index ) => [ <span key={ `s${ index }` }>{ snip }</span>, <br key={ `br${ index }` } /> ] )
		.reduce( ( final, next ) => final.concat( next ), [] )
		.slice( 0, -1 );

export const SeoSiteSearchPreview = React.createClass( {
	shouldComponentUpdate( next ) {
		const current = this.props;

		return ! (
			current.snippet === next.snippet &&
			current.title === next.title &&
			current.url === next.url
		);
	},

	render() {
		const {
			snippet: rawSnippet,
			title,
			url
		} = this.props;

		const snippet = reactifyNewlines( toString( rawSnippet ) );

		return (
			<div className="seo-search-result-preview">
				<h2 className="seo-search-result-preview__header">{ this.translate( 'Google Preview' ) }</h2>
				<div className="seo-search-result-preview__display">
					<div className="seo-search-result-preview__title">{ title }</div>
					<div className="seo-search-result-preview__url">
						{ url } ▾
					</div>
					<div className="seo-search-result-preview__snippet">
						{ snippet }
					</div>
				</div>
			</div>
		);
	}
} );

SeoSiteSearchPreview.propTypes = {
	title: PropTypes.string,
	url: PropTypes.string,
	snippet: PropTypes.string
};

export default SeoSiteSearchPreview;
