import config from '@automattic/calypso-config';
import { TranslateResult, translate } from 'i18n-calypso';
import { filter, orderBy, values } from 'lodash';
import { type ImporterOption } from 'calypso/blocks/import/list';
import InlineSupportLink from 'calypso/components/inline-support-link';
import { appStates } from 'calypso/state/imports/constants';
import type { ImporterPlatform } from 'calypso/lib/importer/types';

export interface ImporterOptionalURL {
	title: TranslateResult;
	description: TranslateResult;
	invalidDescription: TranslateResult;
}

export type ImporterConfigPriority = 'primary' | 'secondary';
export interface ImporterConfig {
	engine: string;
	key: string;
	type: 'file' | 'url';
	priority: ImporterConfigPriority;
	title: string;
	icon: string;
	description: TranslateResult;
	uploadDescription: TranslateResult;
	weight: number;
	overrideDestination?: string;
	optionalUrl?: ImporterOptionalURL;
}

interface ImporterConfigMap {
	[ key: string ]: ImporterConfig;
}

interface ImporterConfigArgs {
	importerState?: string;
	isAtomic?: boolean;
	isJetpack?: boolean;
	siteSlug?: string;
	siteTitle?: string;
}

function getConfig( {
	importerState = '',
	isAtomic = false,
	isJetpack = false,
	siteSlug = '',
	siteTitle = '',
} ): ImporterConfigMap {
	let importerConfig: ImporterConfigMap = {};

	const isFinished = importerState === appStates.IMPORT_SUCCESS;

	importerConfig.wordpress = {
		engine: 'wordpress',
		key: 'importer-type-wordpress',
		type: 'file',
		priority: 'primary',
		title: 'WordPress',
		icon: 'wordpress',
		description: (
			<p>
				{ translate(
					'Import posts, pages, and media from a WordPress export\u00A0file to {{b}}%(siteTitle)s{{/b}}.',
					{
						args: { siteTitle },
						components: {
							b: <strong />,
						},
					}
				) }
			</p>
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
		overrideDestination:
			'/setup/site-migration/site-migration-import-or-migrate?siteSlug=%SITE_SLUG%&siteId=%SITE_ID%&ref=calypso-importer',
		weight: 1,
	};

	importerConfig.blogger = {
		engine: 'blogger',
		key: 'importer-type-blogger',
		type: 'file',
		priority: 'primary',
		title: 'Blogger',
		icon: 'blogger-alt',
		description: (
			<p>
				{ translate(
					'Import posts, pages, comments, tags, and images from a %(importerName)s export file to {{b}}%(siteTitle)s{{/b}}.',
					{
						args: {
							importerName: 'Blogger',
							siteTitle,
						},
						components: {
							b: <strong />,
						},
					}
				) }
			</p>
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
		priority: 'primary',
		title: 'Medium',
		icon: 'medium',
		description: (
			<p>
				{ translate(
					'Import posts, tags, images, and videos ' +
						'from a Medium export file to {{b}}%(siteTitle)s{{/b}}.',
					{
						args: { siteTitle },
						components: {
							b: <strong />,
						},
					}
				) }
			</p>
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
		priority: 'primary',
		title: 'Substack',
		icon: 'substack',
		description: (
			<>
				<p>
					{ translate(
						'Import posts and images, podcasts and public comments from Substack to {{b}}%(siteTitle)s{{/b}}.',
						{
							args: {
								siteTitle,
							},
							components: {
								b: <strong />,
							},
						}
					) }
				</p>
				{ ! isFinished && (
					<p>
						{ translate( 'To import your subscribers, go to {{a}}subscribers page{{/a}}.', {
							components: {
								a: <a href={ `/subscribers/${ siteSlug }#add-subscribers` } />,
							},
						} ) }
					</p>
				) }
			</>
		),
		uploadDescription: (
			<>
				{ translate(
					"To generate a ZIP file of all your Substack posts, go to your Substack {{b}}Settings > Exports{{/b}} and click 'Create a new export.' Once the ZIP file is downloaded, upload it below.",
					{
						components: {
							b: <strong />,
						},
					}
				) }{ ' ' }
				<InlineSupportLink supportContext="importers-substack" showIcon={ false }>
					{ translate( 'Need help?' ) }
				</InlineSupportLink>
			</>
		),
		optionalUrl: {
			title: translate( 'Substack URL' ),
			description: translate(
				'Recommended: Include the Substack URL to import comments and author information.'
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
		priority: 'primary',
		title: 'Squarespace',
		icon: 'squarespace',
		description: (
			<p>
				{ translate(
					'Import posts, pages, comments, tags, and images from a %(importerName)s export file to {{b}}%(siteTitle)s{{/b}}.',
					{
						args: {
							importerName: 'Squarespace',
							siteTitle,
						},
						components: {
							b: <strong />,
						},
					}
				) }
			</p>
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
		priority: 'primary',
		title: 'Wix',
		icon: 'wix',
		description: (
			<p>
				{ translate(
					'Import posts, pages, and media from your Wix.com site to {{b}}%(siteTitle)s{{/b}}.',
					{
						args: { siteTitle },
						components: {
							b: <strong />,
						},
					}
				) }
			</p>
		),
		uploadDescription: translate( 'Enter the URL of your Wix site. ' + '{{supportLink/}}', {
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

	importerConfig.blogroll = {
		engine: 'blogroll',
		key: 'importer-type-blogroll',
		type: 'url',
		priority: 'secondary',
		title: 'Blogroll',
		icon: 'blogroll',
		description: '',
		uploadDescription: '',
		weight: 0,
	};

	importerConfig.livejournal = {
		engine: 'livejournal',
		key: 'importer-type-livejournal',
		type: 'url',
		priority: 'secondary',
		title: 'LiveJournal',
		icon: 'livejournal',
		description: '',
		uploadDescription: '',
		weight: 0,
	};

	importerConfig.movabletype = {
		engine: 'movabletype',
		key: 'importer-type-movabletype',
		type: 'url',
		priority: 'secondary',
		title: 'Movable Type & TypePad',
		icon: 'movabletype',
		description: '',
		uploadDescription: '',
		weight: 0,
	};

	importerConfig.tumblr = {
		engine: 'tumblr',
		key: 'importer-type-tumblr',
		type: 'url',
		priority: 'secondary',
		title: 'Tumblr',
		icon: 'tumblr',
		description: '',
		uploadDescription: '',
		weight: 0,
	};

	importerConfig.xanga = {
		engine: 'xanga',
		key: 'importer-type-xanga',
		type: 'url',
		priority: 'secondary',
		title: 'Xanga',
		icon: 'xanga',
		description: '',
		uploadDescription: '',
		weight: 0,
	};

	const hasUnifiedImporter = config.isEnabled( 'importer/unified' );

	// For Jetpack sites, we don't support migration as destination, so we remove the override here.
	if ( hasUnifiedImporter && isJetpack && ! isAtomic ) {
		delete importerConfig.wordpress.overrideDestination;
	}

	// For atomic sites filter out all importers except the WordPress ones if the Unified Importer is disabled.
	if ( ! hasUnifiedImporter && isAtomic ) {
		importerConfig = { wordpress: importerConfig.wordpress };
	}

	return importerConfig;
}

export function getImporterEngines(): string[] {
	const importerConfig = getConfig( {} );
	const engines = [];

	for ( const config in importerConfig ) {
		engines.push( importerConfig[ config ].engine );
	}

	return engines;
}

export function getImportersAsImporterOption( priority: ImporterConfigPriority ): ImporterOption[] {
	const importerConfig = getConfig( {} );
	const importerOptions: ImporterOption[] = [];

	for ( const config in importerConfig ) {
		if ( importerConfig[ config ].priority !== priority ) {
			continue;
		}

		importerOptions.push( {
			value: importerConfig[ config ].engine as ImporterPlatform,
			label: importerConfig[ config ].title,
			icon: importerConfig[ config ].icon,
			priority: priority,
		} );
	}

	return importerOptions;
}

export function getImporters( args: ImporterConfigArgs = { siteSlug: '', siteTitle: '' } ) {
	const importerConfig = getConfig( args );

	if ( ! config.isEnabled( 'importers/substack' ) ) {
		delete importerConfig.substack;
	}

	const importers = orderBy( values( importerConfig ), [ 'weight', 'title' ], [ 'desc', 'asc' ] );

	return importers;
}

export function getImporterByKey(
	key: string,
	args: ImporterConfigArgs = { siteSlug: '', siteTitle: '' }
) {
	return filter( getImporters( args ), ( importer ) => importer.key === key )[ 0 ];
}

export function isSupportedImporterEngine( engine: string ): boolean {
	const allImporters = getImporters();

	return allImporters.some( ( importer ) => importer.engine === engine );
}

export default getConfig;
