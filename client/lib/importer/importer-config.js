/** @format */

/**
 * External dependencies
 */
import React from 'react';
import { translate } from 'i18n-calypso';
import { filter, head, orderBy, values } from 'lodash';

/**
 * Internal dependencies
 */
import ExternalLink from 'components/external-link';

function getConfig( { siteTitle = '' } = {} ) {
	const importerConfig = {};

	importerConfig.wordpress = {
		engine: 'wordpress',
		key: 'importer-type-wordpress',
		type: 'file',
		title: 'WordPress',
		icon: 'wordpress',
		description: translate( 'Import posts, pages, and media from a WordPress export\u00A0file.' ),
		uploadDescription: translate(
			'Upload a {{b}}WordPress export file{{/b}} to start ' +
				'importing into {{b2}}%(title)s{{/b2}}. A WordPress export is ' +
				'an XML file with your page and post content, or a zip archive ' +
				'containing several XML files. ' +
				'Need help {{ExternalLink}}exporting your content{{/ExternalLink}}?',
			{
				args: { title: siteTitle },
				components: {
					b: <strong />,
					b2: <strong />,
					ExternalLink: (
						<ExternalLink href="https://en.support.wordpress.com/coming-from-self-hosted/" />
					),
				},
			}
		),
		weight: 1,
	};

	importerConfig.blogger = {
		engine: 'blogger',
		key: 'importer-type-blogger',
		type: 'file',
		title: 'Blogger',
		icon: 'blogger-alt',
		description: translate(
			'Import posts, pages, comments, tags, and images from a %(importerName)s export file.',
			{
				args: {
					importerName: 'Blogger',
				},
			}
		),
		uploadDescription: translate(
			'Upload a {{b}}%(importerName)s export file{{/b}} ' +
				'to start importing into {{b}}%(siteTitle)s{{/b}}. ' +
				'A %(importerName)s export file is an XML file ' +
				'containing your page and post content. ' +
				'Need help {{ExternalLink}}exporting your content{{/ExternalLink}}?',
			{
				args: {
					importerName: 'Blogger',
					siteTitle,
				},
				components: {
					b: <strong />,
					ExternalLink: (
						<ExternalLink href="https://en.support.wordpress.com/import/coming-from-blogger/" />
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
			'Import posts, pages, and media from sites made with the GoDaddy GoCentral website builder.'
		),
		uploadDescription: translate( 'Type your existing site URL to start the import.' ),
		weight: 0,
	};

	importerConfig.medium = {
		engine: 'medium',
		key: 'importer-type-medium',
		type: 'file',
		title: 'Medium',
		icon: 'medium',
		description: translate(
			'Import posts, tags, images, and videos ' + 'from a Medium export file.'
		),
		uploadDescription: translate(
			'Upload your {{b}}%(importerName)s export file{{/b}} to start importing into ' +
				'{{b}}%(siteTitle)s{{/b}}. A %(importerName)s export file is a ZIP ' +
				'file containing several HTML files with your stories. ' +
				'Need help {{ExternalLink}}exporting your content{{/ExternalLink}}?',
			{
				args: {
					importerName: 'Medium',
					siteTitle,
				},
				components: {
					b: <strong />,
					ExternalLink: (
						<ExternalLink href={ 'https://en.support.wordpress.com/import/import-from-medium/' } />
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
			'Import posts, pages, comments, tags, and images from a %(importerName)s export file.',
			{
				args: {
					importerName: 'Squarespace',
				},
			}
		),
		uploadDescription: translate(
			'Upload a {{b}}%(importerName)s export file{{/b}} ' +
				'to start importing into {{b}}%(siteTitle)s{{/b}}. ' +
				'A %(importerName)s export file is an XML file ' +
				'containing your page and post content. ' +
				'Need help {{ExternalLink}}exporting your content{{/ExternalLink}}?',
			{
				args: {
					importerName: 'Squarespace',
					siteTitle,
				},
				components: {
					b: <strong />,
					ExternalLink: (
						<ExternalLink
							href={ 'https://en.support.wordpress.com/import/import-from-squarespace' }
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
		description: translate( 'Import posts, pages, and media from your Wix.com site.' ),
		uploadDescription: translate( 'Type your existing site URL to start the import.' ),
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
	return filter( getImporters( params ), importer => importer.type === 'file' );
}

export function getImporterByKey( key, params = {} ) {
	return head( filter( getImporters( params ), importer => importer.key === key ) );
}

export default getConfig;
