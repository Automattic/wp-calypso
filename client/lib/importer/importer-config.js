/**
 * External dependencies
 */
import React from 'react';
import { translate } from 'i18n-calypso';
import { filter, head, orderBy, values } from 'lodash';

/**
 * Internal dependencies
 */
import InlineSupportLink from 'components/inline-support-link';

function getConfig( { siteTitle = '' } = {} ) {
	const importerConfig = {};

	importerConfig.wordpress = {
		engine: 'wordpress',
		key: 'importer-type-wordpress',
		type: 'file',
		title: 'WordPress',
		icon: 'wordpress',
		description: translate(
			'Import posts, pages, and media from a WordPress export\u00A0file to {{b}}%(siteTitle)s{{/b}}.',
			{
				args: {
					siteTitle,
				},
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
						<InlineSupportLink
							supportPostId={ 67084 }
							supportLink="https://wordpress.com/support/coming-from-self-hosted/"
							showIcon={ false }
							text={ translate( 'Need help exporting your content?' ) }
						/>
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
					siteTitle,
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
						<InlineSupportLink
							supportPostId={ 66764 }
							supportLink="https://wordpress.com/support/import/coming-from-blogger/"
							showIcon={ false }
							text={ translate( 'Need help exporting your content?' ) }
						/>
					),
				},
			}
		),
		weight: 0,
	};

	importerConfig[ 'godaddy-gocentral' ] = {
		engine: 'godaddy-gocentral',
		key: 'importer-type-godaddy-gocentral',
		type: 'url',
		title: 'GoDaddy',
		icon: 'godaddy-gocentral',
		description: translate(
			'Import posts, pages, and media from sites made with the GoDaddy GoCentral website builder to {{b}}%(siteTitle)s{{/b}}.',
			{
				args: {
					siteTitle,
				},
				components: {
					b: <strong />,
				},
			}
		),
		uploadDescription: translate( 'Enter the URL of your existing site. ' + '{{supportLink/}}', {
			components: {
				supportLink: (
					<InlineSupportLink
						supportPostId={ 154436 }
						supportLink="https://wordpress.com/support/import/import-from-godaddy/"
						showIcon={ false }
						text={ translate( 'Need help?' ) }
					/>
				),
			},
		} ),
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
				args: {
					siteTitle,
				},
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
						<InlineSupportLink
							supportPostId={ 93180 }
							supportLink="https://wordpress.com/support/import/import-from-medium/"
							showIcon={ false }
							text={ translate( 'Need help exporting your content?' ) }
						/>
					),
				},
			}
		),
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
					siteTitle,
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
						<InlineSupportLink
							supportPostId={ 87696 }
							supportLink="https://wordpress.com/support/import/import-from-squarespace/"
							showIcon={ false }
							text={ translate( 'Need help exporting your content?' ) }
						/>
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
				args: {
					siteTitle,
				},
				components: {
					b: <strong />,
				},
			}
		),
		uploadDescription: translate( 'Enter the URL of your existing site. ' + '{{supportLink/}}', {
			components: {
				supportLink: (
					<InlineSupportLink
						supportPostId={ 147777 }
						supportLink="https://wordpress.com/support/import/import-from-wix/"
						showIcon={ false }
						text={ translate( 'Need help?' ) }
					/>
				),
			},
		} ),
		weight: 0,
	};

	return importerConfig;
}

export function getImporters( params = {} ) {
	const importers = orderBy(
		values( getConfig( params ) ),
		[ 'weight', 'title' ],
		[ 'desc', 'asc' ]
	);

	return importers;
}

export function getFileImporters( params = {} ) {
	return filter( getImporters( params ), ( importer ) => importer.type === 'file' );
}

export function getImporterByKey( key, params = {} ) {
	return head( filter( getImporters( params ), ( importer ) => importer.key === key ) );
}

export default getConfig;
