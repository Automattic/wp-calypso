import config from '@automattic/calypso-config';
import { translate } from 'i18n-calypso';
import { filter, orderBy, values } from 'lodash';
import InlineSupportLink from 'calypso/components/inline-support-link';

export interface ImporterOptionalURL {
	title: React.ReactChild;
	description: React.ReactChild;
	invalidDescription: React.ReactChild;
}

export interface ImporterConfig {
	engine: string;
	key: string;
	type: 'file' | 'url';
	title: string;
	icon: string;
	description: React.ReactChild;
	uploadDescription: React.ReactChild;
	weight: number;
	overrideDestination?: string;
	optionalUrl?: ImporterOptionalURL;
}

interface ImporterConfigMap {
	[ key: string ]: ImporterConfig;
}

interface ImporterConfigArgs {
	siteTitle?: string;
}

function getConfig(
	args: ImporterConfigArgs = { siteTitle: '' }
): { [ key: string ]: ImporterConfig } {
	const importerConfig: ImporterConfigMap = {};

	importerConfig.wordpress = {
		engine: 'wordpress',
		key: 'importer-type-wordpress',
		type: 'file',
		title: 'WordPress',
		icon: 'wordpress',
		description: translate(
			'Import posts, pages, and media from a WordPress export\u00A0file to {{b}}%(siteTitle)s{{/b}}.',
			{
				args,
				components: {
					b: <strong />,
				},
			}
		),
		uploadDescription: translate(
			'A WordPress export is ' +
				'an XML file with your page and post content, or a zip archive ' +
				'containing several XML files. ' +
				'{{supportLink/}}',
			{
				components: {
					supportLink: (
						<InlineSupportLink supportContext="importers-wordpress" showIcon={ false }>
							{ translate( 'Need help exporting your content?' ) }
						</InlineSupportLink>
					),
				},
			}
		),
		overrideDestination: '/migrate/%SITE_SLUG%',
		weight: 1,
	};

	importerConfig.blogger = {
		engine: 'blogger',
		key: 'importer-type-blogger',
		type: 'file',
		title: 'Blogger',
		icon: 'blogger-alt',
		description: translate(
			'Import posts, pages, comments, tags, and images from a %(importerName)s export file to {{b}}%(siteTitle)s{{/b}}.',
			{
				args: {
					importerName: 'Blogger',
					siteTitle: args.siteTitle,
				},
				components: {
					b: <strong />,
				},
			}
		),
		uploadDescription: translate(
			'A %(importerName)s export file is an XML file ' +
				'containing your page and post content. ' +
				'{{supportLink/}}',
			{
				args: {
					importerName: 'Blogger',
				},
				components: {
					supportLink: (
						<InlineSupportLink supportContext="importers-blogger" showIcon={ false }>
							{ translate( 'Need help exporting your content?' ) }
						</InlineSupportLink>
					),
				},
			}
		),
		weight: 0,
	};

	importerConfig.medium = {
		engine: 'medium',
		key: 'importer-type-medium',
		type: 'file',
		title: 'Medium',
		icon: 'medium',
		description: translate(
			'Import posts, tags, images, and videos ' +
				'from a Medium export file to {{b}}%(siteTitle)s{{/b}}.',
			{
				args,
				components: {
					b: <strong />,
				},
			}
		),
		uploadDescription: translate(
			'A %(importerName)s export file is a ZIP ' +
				'file containing several HTML files with your stories. ' +
				'{{supportLink/}}',
			{
				args: {
					importerName: 'Medium',
				},
				components: {
					supportLink: (
						<InlineSupportLink supportContext="importers-medium" showIcon={ false }>
							{ translate( 'Need help exporting your content?' ) }
						</InlineSupportLink>
					),
				},
			}
		),
		weight: 0,
	};

	importerConfig.substack = {
		engine: 'substack',
		key: 'importer-type-substack',
		type: 'file',
		title: 'Substack',
		icon: 'substack',
		description: translate(
			'Import posts and images, podcasts and public comments from a %(importerName)s export file to {{b}}%(siteTitle)s{{/b}}.',
			{
				args: {
					importerName: 'Substack',
					siteTitle: args.siteTitle,
				},
				components: {
					b: <strong />,
				},
			}
		),
		uploadDescription: translate(
			'A %(importerName)s export file is a ZIP file ' +
				'containing a CSV file with all posts and individual HTML posts. ' +
				'{{supportLink/}}',
			{
				args: {
					importerName: 'Substack',
				},
				components: {
					supportLink: (
						<InlineSupportLink supportContext="importers-substack" showIcon={ false }>
							{ translate( 'Need help exporting your content?' ) }
						</InlineSupportLink>
					),
				},
			}
		),
		optionalUrl: {
			title: translate( 'Substack Newsletter URL' ),
			description: translate(
				'Recommended: A Substack Newsletter URL to import comments and author information.'
			),
			invalidDescription: translate( 'Enter a valid Substack Newsletter URL (%(exampleUrl)s).', {
				args: { exampleUrl: 'https://example-newsletter.substack.com/' },
			} ),
		},
		weight: 0,
	};

	importerConfig.squarespace = {
		engine: 'squarespace',
		key: 'importer-type-squarespace',
		type: 'file',
		title: 'Squarespace',
		icon: 'squarespace',
		description: translate(
			'Import posts, pages, comments, tags, and images from a %(importerName)s export file to {{b}}%(siteTitle)s{{/b}}.',
			{
				args: {
					importerName: 'Squarespace',
					siteTitle: args.siteTitle,
				},
				components: {
					b: <strong />,
				},
			}
		),
		uploadDescription: translate(
			'A %(importerName)s export file is an XML file ' +
				'containing your page and post content. ' +
				'{{supportLink/}}',
			{
				args: {
					importerName: 'Squarespace',
				},
				components: {
					supportLink: (
						<InlineSupportLink supportContext="importers-squarespace" showIcon={ false }>
							{ translate( 'Need help exporting your content?' ) }
						</InlineSupportLink>
					),
				},
			}
		),
		weight: 0,
	};

	importerConfig.wix = {
		engine: 'wix',
		key: 'importer-type-wix',
		type: 'url',
		title: 'Wix',
		icon: 'wix',
		description: translate(
			'Import posts, pages, and media from your Wix.com site to {{b}}%(siteTitle)s{{/b}}.',
			{
				args,
				components: {
					b: <strong />,
				},
			}
		),
		uploadDescription: translate( 'Enter the URL of your existing site. ' + '{{supportLink/}}', {
			components: {
				supportLink: (
					<InlineSupportLink supportContext="importers-wix" showIcon={ false }>
						{ translate( 'Need help?' ) }
					</InlineSupportLink>
				),
			},
		} ),
		weight: 0,
	};

	return importerConfig;
}

export function getImporters( args: ImporterConfigArgs = { siteTitle: '' } ) {
	const importerConfig = getConfig( args );

	if ( ! config.isEnabled( 'importers/substack' ) ) {
		delete importerConfig.substack;
	}

	const importers = orderBy( values( importerConfig ), [ 'weight', 'title' ], [ 'desc', 'asc' ] );

	return importers;
}

export function getImporterByKey( key: string, args: ImporterConfigArgs = { siteTitle: '' } ) {
	return filter( getImporters( args ), ( importer ) => importer.key === key )[ 0 ];
}

export default getConfig;
