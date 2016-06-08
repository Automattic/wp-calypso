import React, { PropTypes } from 'react';
import PureRenderMixin from 'react-pure-render/mixin';

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
						{ title }
					</div>
					<div className="seo-search-preview__url">
						{ url } ▾
					</div>
					<div className="seo-search-preview__snippet">
						{ snippet }
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

export default SearchPreview;
