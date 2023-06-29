import { translate } from 'i18n-calypso';

export const getIAmDeveloperCopy = ( translateFunction: typeof translate ) =>
	translateFunction(
		'{{strong}}I am a developer.{{/strong}} Make my WordPress.com experience more powerful and grant me early access to developer features.',
		{
			components: {
				strong: <strong />,
			},
		}
	);
