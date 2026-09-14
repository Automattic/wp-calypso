import { useTranslate } from 'i18n-calypso';
import DocumentHead from 'calypso/components/data/document-head';

export const DiscoverDocumentHead = ( { noindex = false } ) => {
	const translate = useTranslate();

	const title = translate( 'Browse popular blogs & read articles ‹ Reader' );

	const meta = [
		{
			name: 'description',
			content: translate(
				'Explore millions of blogs on WordPress.com. Discover posts, from food and art to travel and photography, and find popular sites that inspire and inform.'
			),
		},
	];

	if ( noindex ) {
		meta.push( { name: 'robots', content: 'noindex' } );
	}

	const link = [
		{
			rel: 'alternate',
			type: 'application/rss+xml',
			title: translate( 'Discover RSS Feed' ),
			href: 'https://public-api.wordpress.com/rest/v1.2/freshly-pressed/feed',
		},
	];

	return <DocumentHead title={ title } meta={ meta } link={ link } />;
};
