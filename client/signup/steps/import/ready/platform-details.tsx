import { Modal } from '@wordpress/components';
import { createElement, createInterpolateElement } from '@wordpress/element';
import { Icon, close, check } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import { FeatureName, FeatureList } from '../types';
import type * as React from 'react';

/* eslint-disable wpcalypso/jsx-classname-namespace */

interface DetailsProps {
	platform: string;
	onClose: () => void;
}

export const coveredPlatforms = [ 'wix', 'squarespace', 'blogger', 'wordpress', 'medium' ];

const platformFeatureList: { [ key: string ]: { [ key: string ]: FeatureName[] } } = {
	wix: {
		supported: [ 'posts', 'pages_static', 'blocks', 'images' ],
		unsupported: [ 'styles', 'themes', 'colors', 'fonts' ],
	},
	squarespace: {
		supported: [ 'posts', 'pages_static', 'blocks', 'images' ],
		unsupported: [ 'styles', 'themes', 'colors', 'fonts' ],
	},
	blogger: {
		supported: [ 'posts', 'photos', 'videos', 'files' ],
		unsupported: [ 'styles', 'themes', 'colors', 'fonts' ],
	},
	wordpress: {
		supported: [ 'posts', 'pages', 'themes', 'plugins' ],
		unsupported: [ 'styles', 'fonts', 'colors' ],
	},
	medium: {
		supported: [ 'posts', 'tags' ],
		unsupported: [ 'styles', 'themes', 'colors', 'fonts' ],
	},
};

const ImportPlatformDetails: React.FunctionComponent< DetailsProps > = ( data ) => {
	const { __ } = useI18n();
	const { platform, onClose } = data;
	const learnMoreHref = 'https://wordpress.com/support/import';

	const translatedFeatureList: FeatureList = {
		tags: __( 'Tags' ),
		posts: __( 'Blog posts' ),
		pages: __( 'Pages' ),
		pages_static: __( 'Static pages' ),
		blocks: __( 'Various blocks and features' ),
		images: __( 'Images' ),
		photos: __( 'Photos' ),
		videos: __( 'Videos' ),
		files: __( 'Other embedded files' ),
		styles: __( 'Site styles' ),
		themes: __( 'Themes' ),
		themes_custom: __( 'Custom themes' ),
		colors: __( 'Colors' ),
		fonts: __( 'Fonts' ),
		plugins: __( 'Plugins' ),
	};

	const getTitle = ( _platform: string ): string => {
		switch ( _platform ) {
			case 'wix':
				return __( 'Importing content from Wix' );
			case 'squarespace':
				return __( 'Importing content from Squarespace' );
			case 'blogger':
				return __( 'Importing content from Blogger' );
			case 'wordpress':
				return __( 'Importing content from self-hosted WordPress to WordPress.com' );
			case 'medium':
				return __( 'Importing content from Medium' );
			default:
				return '';
		}
	};

	const getInfo = ( _platform: string ): string => {
		switch ( _platform ) {
			case 'wix':
				return __(
					"Our Wix content importer is the quickest way to move your content. Simply click 'Import your content' and provide your site's web address (called a URL). Once the import is complete, you'll have a site that's pre-filled with your content."
				);
			case 'squarespace':
				return __(
					"Our Squarespace content importer is the quickest way to move your content. Simply export the contents from Squarespace as a WordPress format XML file, then click 'Import your content' and upload it to our importer."
				);
			case 'blogger':
				return __(
					"Our Blogger content importer is the quickest way to move your content. Simply export the contents from Blogger as a XML file, then click 'Import your content' and upload it to our importer."
				);
			case 'wordpress':
				return __(
					"Our Self-Hosted WordPress content importer is the quickest way to move your content. After clicking 'Import your content', either enter your site's URL to move all your content, plugins, and custom themes to WordPress.com, or use the 'Import' feature to import just your site's content, including posts, pages, and media."
				);
			case 'medium':
				return __(
					"Our Medium content importer is the quickest way to move your content. Simply export the contents from Medium as a .ZIP file, then click 'Import your content' and upload it to our importer."
				);
			default:
				return '';
		}
	};

	return (
		<Modal
			className="components-modal-new__frame import__details-modal"
			title={ getTitle( platform ) }
			onRequestClose={ onClose }
		>
			<div className="import__details-modal-content">
				<p>{ getInfo( platform ) }</p>

				<a
					className="import__details-learn-more"
					href={ learnMoreHref }
					target="_blank"
					rel="noopener noreferrer"
				>
					{ __( 'Learn more' ) }
				</a>

				<div className={ 'import__details-features' }>
					<p>
						{ createInterpolateElement( __( 'Things we <strong>can</strong> import:' ), {
							strong: createElement( 'strong' ),
						} ) }
					</p>
					<ul className={ 'import__details-list' }>
						{ platformFeatureList[ platform ].supported.map( ( key ) => (
							<li key={ key }>
								<Icon size={ 20 } icon={ check } /> { translatedFeatureList[ key as FeatureName ] }
							</li>
						) ) }
					</ul>

					<p>
						{ createInterpolateElement( __( "Things we <strong>can't</strong> import:" ), {
							strong: createElement( 'strong' ),
						} ) }
					</p>
					<ul className={ 'import__details-list' }>
						{ platformFeatureList[ platform ].unsupported.map( ( key ) => (
							<li key={ key }>
								<Icon size={ 20 } icon={ close } /> { translatedFeatureList[ key as FeatureName ] }
							</li>
						) ) }
					</ul>
				</div>
			</div>
		</Modal>
	);
};

export default ImportPlatformDetails;
