import { Modal } from '@wordpress/components';
import { createElement, createInterpolateElement } from '@wordpress/element';
import { Icon, close, check } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import type * as React from 'react';

/* eslint-disable wpcalypso/jsx-classname-namespace */

interface DetailsProps {
	platform: string;
	onClose: () => void;
}

const ImportPlatformDetails: React.FunctionComponent< DetailsProps > = ( data ) => {
	const { __ } = useI18n();
	const { platform, onClose } = data;
	const learnMoreHref = 'https://wordpress.com/support/import';

	const getTitle = ( _platform: string ): string => {
		switch ( _platform ) {
			case 'Wix':
				return __( 'Importing content from Wix' );
			case 'Squarespace':
				return __( 'Importing content from Squarespace' );
			case 'Blogger':
				return __( 'Importing content from Blogger' );
			case 'Wordpress':
				return __( 'Importing content from self-hosted WordPress to WordPress.com' );
			case 'Medium':
				return __( 'Importing content from Medium' );
			default:
				return '';
		}
	};

	const getInfo = ( _platform: string ): string => {
		switch ( _platform ) {
			case 'Wix':
				return __(
					"Our Wix content importer is the quickest way to move your content. Simply click 'Import your content' and provide your site's web address (called a URL). Once the import is complete, you'll have a site that's pre-filled with your content."
				);
			case 'Squarespace':
				return __(
					"Our Squarespace content importer is the quickest way to move your content. Simply export the contents from Squarespace as a WordPress format XML file, then click 'Import your content' and upload it to our importer."
				);
			case 'Blogger':
				return __(
					"Our Blogger content importer is the quickest way to move your content. Simply export the contents from Blogger as a XML file, then click 'Import your content' and upload it to our importer."
				);
			case 'Wordpress':
				return __(
					"Our Self-Hosted WordPress content importer is the quickest way to move your content. After clicking 'Import your content', either enter your site's URL to move all your content, plugins, and custom themes to WordPress.com, or use the 'Import' feature to import just your site's content, including posts, pages, and media."
				);
			case 'Medium':
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
						<li>
							<Icon size={ 20 } icon={ check } /> { __( 'Blog posts' ) }
						</li>
						<li>
							<Icon size={ 20 } icon={ check } /> { __( 'Static pages' ) }
						</li>
						<li>
							<Icon size={ 20 } icon={ check } /> { __( 'Various blocks and features' ) }
						</li>
						<li>
							<Icon size={ 20 } icon={ check } /> { __( 'Images' ) }
						</li>
					</ul>

					<p>
						{ createInterpolateElement( __( "Things we <strong>can't</strong> import:" ), {
							strong: createElement( 'strong' ),
						} ) }
					</p>
					<ul className={ 'import__details-list' }>
						<li>
							<Icon size={ 20 } icon={ close } /> { __( 'Site styles' ) }
						</li>
						<li>
							<Icon size={ 20 } icon={ close } /> { __( 'Themes' ) }
						</li>
						<li>
							<Icon size={ 20 } icon={ close } /> { __( 'Colors' ) }
						</li>
						<li>
							<Icon size={ 20 } icon={ close } /> { __( 'Fonts' ) }
						</li>
					</ul>
				</div>
			</div>
		</Modal>
	);
};

export default ImportPlatformDetails;
