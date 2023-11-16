import config from '@automattic/calypso-config';
import { TranslateResult, translate } from 'i18n-calypso';
import { filter, orderBy, values } from 'lodash';
import InlineSupportLink from 'calypso/components/inline-support-link';
import { appStates } from 'calypso/state/imports/constants';

export interface ImporterOptionalURL {
	title: TranslateResult;
	description: TranslateResult;
	invalidDescription: TranslateResult;
}

export interface ImporterConfig {
	engine: string;
	key: string;
	type: 'file' | 'url';
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
		overrideDestination: '/migrate/%SITE_SLUG%',
		weight: 1,
	};

	importerConfig.blogger = {
		engine: 'blogger',
		key: 'importer-type-blogger',
		type: 'file',
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
		title: 'Substack',
		icon: 'substack',
		description: (
			<>
				<p>
					{ translate(
						'Import posts and images, podcasts and public comments from a Substack export file to {{b}}%(siteTitle)s{{/b}}.',
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
					'A Substack export file is a ZIP file containing a CSV file with all posts.'
				) }{ ' ' }
				<InlineSupportLink supportContext="importers-substack" showIcon={ false }>
					{ translate( 'See how to get your export file.' ) }
				</InlineSupportLink>
			</>
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

export default getConfig;
