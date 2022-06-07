import { translate, TranslateOptions, TranslateOptionsText } from 'i18n-calypso';
import React from 'react';
import { convertPlatformName } from 'calypso/blocks/import/util';
import importerConfig, { ImporterConfig } from 'calypso/lib/importer/importer-config';
import SupportLink from '../support-link';
import type { Importer } from 'calypso/blocks/importer/types';

const translateConfig: { [ key: string ]: Partial< ImporterConfig > } = {
	blogger: {
		description:
			'Import posts, pages, comments, tags, and images from a %(importerName)s export file.',
		uploadDescription:
			'A %(importerName)s export is ' +
			'an XML file with your page and post content, or a zip archive ' +
			'containing several XML files. ' +
			'{{supportLink/}}',
	},
	medium: {
		description:
			'Import your posts, tags, images, and videos from your %(importerName)s export file',
		uploadDescription:
			'A %(importerName)s export file is a ZIP file containing several HTML files with your stories. ' +
			'{{supportLink/}}',
	},
	squarespace: {
		description:
			'Import posts, pages, comments, tags, and images from a %(importerName)s export file.',
		uploadDescription:
			'A %(importerName)s export is ' +
			'an XML file with your page and post content, or a zip archive ' +
			'containing several XML files. ' +
			'{{supportLink/}}',
	},
	wordpress: {
		description: 'Import posts, pages, and media from your %(importerName)s export file.',
		uploadDescription:
			'A %(importerName)s export is ' +
			'an XML file with your page and post content, or a zip archive ' +
			'containing several XML files. ' +
			'{{supportLink/}}',
	},
};

export function getImportDragConfig( importer: Importer, supportLinkModal?: boolean ) {
	const importerData = importerConfig()[ importer ];

	const options: TranslateOptions = {
		args: {
			importerName: convertPlatformName( importer ),
		},
		components: {
			supportLink: <SupportLink importer={ importer } supportLinkModal={ supportLinkModal } />,
		},
	};

	importerData.title = translate( 'Import content from %(importerName)s', {
		...options,
		textOnly: true,
	} as TranslateOptionsText ) as string;

	importerData.description = translate(
		// eslint-disable-next-line wpcalypso/i18n-no-variables
		translateConfig[ importer ].description as string,
		options
	);

	importerData.uploadDescription = translate(
		// eslint-disable-next-line wpcalypso/i18n-no-variables
		translateConfig[ importer ].uploadDescription as string,
		options
	);

	return importerData;
}
