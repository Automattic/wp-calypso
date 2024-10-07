import { useTranslate } from 'i18n-calypso';
import DocumentHead from 'calypso/components/data/document-head';

export const DiscoverDocumentHead = ( { tabTitle } ) => {
	const translate = useTranslate();

	const title = translate( 'Browse %s blogs & read articles ‹ Reader', {
		args: [ tabTitle ],
		comment: '%s is the type of blog being explored e.g. food, art, technology etc.',
	} );

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
