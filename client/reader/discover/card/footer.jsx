/**
 * External dependencies
 */
import React from 'react';
import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty'

/**
 * Internal dependencies
 */
import SiteIcon from 'components/site-icon';

function renderSiteInfo( site ) {
	return (
		<div>
			<a href={ get( site, 'blog_url' ) }>
				<SiteIcon site={ site } size={ 30 } />
			</a>
			<div className="reader-discover-card__site-info">
				<a href={ get( site, 'blog_url' ) }>
					<h1 className="reader-discover-card__site-title is-byline">{ get( site, 'blog_name' ) }</h1>
				</a>
				<div className="reader-discover-card__author is-byline">
					by <a href={ get( site, 'author_url' ) }>{ get( site, 'author_name' ) }</a>
				</div>
			</div>
		</div>
	);
}

const DiscoverCardFooter = ( props ) => {

	const { site, categories } = props;

	return (
		<footer className="reader-discover-card__footer">
			{ ! isEmpty( site ) ? renderSiteInfo( site ) : null }
		</footer>
	);
};

DiscoverCardFooter.propTypes = {
	site: React.PropTypes.object,
	categories: React.PropTypes.object
};

export default DiscoverCardFooter;
