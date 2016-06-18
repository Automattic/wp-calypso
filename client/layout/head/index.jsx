/** @ssr-ready **/

/**
 * External dependencies
 */
import React from 'react';
import Helmet from 'react-helmet';
import debugFactory from 'debug';

const debug = debugFactory( 'calypso:layout:head' );

const Head = ( { title, description, canonicalUrl, type, site_name, image, children } ) => (
	<div>
		<Helmet
			title={ title }
			meta={ [
				description ? { name: 'description', property: 'og:description', content: description } : {},
				title ? { property: 'og:title', content: title } : {},
				canonicalUrl ? { property: 'og:url', content: canonicalUrl } : {},
				type ? { property: 'og:type', content: type } : {},
				site_name ? { property: 'og:site_name', content: site_name } : {},
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
	children: React.PropTypes.node,
};

export default Head;
