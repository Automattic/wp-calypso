/** @ssr-ready **/

/**
 * External dependencies
 */
import React from 'react';
import Helmet from 'react-helmet';
import debugFactory from 'debug';

const debug = debugFactory( 'calypso:layout:head' );

const Head = ( { title, description, canonicalUrl, type, siteName, image, children } ) => (
	<div>
		<Helmet
			title={ title }
			meta={ [
				description ? { name: 'description', property: 'og:description', content: description } : {},
				title ? { property: 'og:title', content: title } : {},
				canonicalUrl ? { property: 'og:url', content: canonicalUrl } : {},
				type ? { property: 'og:type', content: type } : {},
				siteName ? { property: 'og:site_name', content: siteName } : {},
				image ? { property: 'og:image', content: image } : {},
			] }
			link={ [
				canonicalUrl ? { rel: 'canonical', href: canonicalUrl } : {}
			] }
			onChangeClientState={ debug }
		/>
		{ children }
	</div>
);

Head.displayName = 'Head';
Head.propTypes = {
	title: React.PropTypes.string,
	description: React.PropTypes.string,
	canonicalUrl: React.PropTypes.string,
	type: React.PropTypes.string,
	siteName: React.PropTypes.string,
	image: React.PropTypes.string,
	children: React.PropTypes.node,
};

Head.defaultProps = { site_name: 'WordPress.com' };

export default Head;
