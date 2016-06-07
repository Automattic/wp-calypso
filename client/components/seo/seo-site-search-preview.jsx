import React, { PropTypes } from 'react';
import PureRenderMixin from 'react-pure-render/mixin';

export const SeoSiteSearchPreview = React.createClass( {
	mixins: [ PureRenderMixin ],

	render() {
		const {
			snippet,
			title,
			url
		} = this.props;

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
