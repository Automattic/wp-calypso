/** @ssr-ready **/

/**
 * External dependencies
 */
import React from 'react';
import Helmet from 'react-helmet';
import debugFactory from 'debug';

const debug = debugFactory( 'calypso:layout:head' );

const Head = ( { title, description, canonicalUrl, children } ) => (
	<div>
		<Helmet
			title={ title }
			meta={ [
				description ? { name: 'description', property: 'og:description', content: description } : {},
				title ? { property: 'og:title', content: title } : {},
				canonicalUrl ? { property: 'og:url', content: canonicalUrl } : {},
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
