import { translate as translateFunction } from 'i18n-calypso';

export const getIAmDeveloperCopy = ( translate: typeof translateFunction ) =>
	translate(
		'{{strong}}I am a developer{{/strong}} {{span}}Opt me into previews of new developer-focused features.{{/span}}',
		{
			components: {
				strong: <strong />,
				span: <span />,
			},
		}
	);
