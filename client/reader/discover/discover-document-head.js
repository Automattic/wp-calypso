import { useTranslate } from 'i18n-calypso';
import DocumentHead from 'calypso/components/data/document-head';

export const DiscoverDocumentHead = () => {
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

	return <DocumentHead title={ title } meta={ meta } />;
};
