import { translate, TranslateOptions, TranslateOptionsText } from 'i18n-calypso';
import React from 'react';
import { convertPlatformName } from 'calypso/blocks/import/util';
import importerConfig, { ImporterConfig } from 'calypso/lib/importer/importer-config';
import SupportLink from '../support-link';
import type { Importer } from 'calypso/blocks/importer/types';

export function getImportDragConfig( importer: Importer, supportLinkModal?: boolean ) {
	const options: TranslateOptions = {
		args: {
			importerName: convertPlatformName( importer ),
		},
		components: {
			supportLink: <SupportLink importer={ importer } supportLinkModal={ supportLinkModal } />,
		},
	};
	const translateConfig: { [ key: string ]: Partial< ImporterConfig > } = {
		blogger: {
			description: translate(
				'Import posts, pages, comments, tags, and images from a %(importerName)s export file.',
				options
			),
			uploadDescription: translate(
				'A %(importerName)s export is ' +
					'an XML file with your page and post content, or a zip archive ' +
					'containing several XML files. ' +
					'{{supportLink/}}',
				options
			),
		},
		medium: {
			description: translate(
				'Import your posts, tags, images, and videos from your %(importerName)s export file',
				options
			),
			uploadDescription: translate(
				'A %(importerName)s export file is a ZIP file containing several HTML files with your stories. ' +
					'{{supportLink/}}',
				options
			),
		},
		squarespace: {
			description: translate(
				'Import posts, pages, comments, tags, and images from a %(importerName)s export file.',
				options
			),
			uploadDescription: translate(
				'A %(importerName)s export is ' +
					'an XML file with your page and post content, or a zip archive ' +
					'containing several XML files. ' +
					'{{supportLink/}}',
				options
			),
		},
		wordpress: {
			description: translate(
				'Import posts, pages, and media from your %(importerName)s export file.',
				options
			),
			uploadDescription: translate(
				'A %(importerName)s export is ' +
					'an XML file with your page and post content, or a zip archive ' +
					'containing several XML files. ' +
					'{{supportLink/}}',
				options
			),
		},
	};
	const importerData = importerConfig( {} )[ importer ];

	importerData.title = translate( 'Import content from %(importerName)s', {
		...options,
		textOnly: true,
	} as TranslateOptionsText ) as string;

	importerData.description = translateConfig[ importer ].description as string;
	importerData.uploadDescription = translateConfig[ importer ].uploadDescription as string;

	return importerData;
}
