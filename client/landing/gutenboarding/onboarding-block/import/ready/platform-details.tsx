import { BackButton } from '@automattic/onboarding';
import { Modal, Panel, PanelBody } from '@wordpress/components';
import { createElement, createInterpolateElement } from '@wordpress/element';
import { Icon, close, check } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import * as React from 'react';

/* eslint-disable wpcalypso/jsx-classname-namespace */

interface DetailsProps {
	platform: string;
	onClose: () => void;
}

const WixPanelInfo: React.FunctionComponent< DetailsProps > = () => {
	const { __ } = useI18n();

	return (
		<Panel>
			<PanelBody title={ __( 'Import to a new site' ) } initialOpen={ false }>
				<p>Body txt: lorem ipsum dolor sit amet</p>
			</PanelBody>
			<PanelBody title={ __( 'Import to an existing site' ) } initialOpen={ false }>
				<p>Body txt: lorem ipsum dolor sit amet</p>
			</PanelBody>
		</Panel>
	);
};

const SquarespacePanelInfo: React.FunctionComponent< DetailsProps > = () => {
	const { __ } = useI18n();

	return (
		<Panel>
			<PanelBody title={ __( 'Downloading your Squarespace export file' ) } initialOpen={ false }>
				<p>Body txt: lorem ipsum dolor sit amet</p>
			</PanelBody>
			<PanelBody
				title={ __( 'Importing your Squarespace export file to WordPress.com' ) }
				initialOpen={ false }
			>
				<p>Body txt: lorem ipsum dolor sit amet</p>
			</PanelBody>
			<PanelBody title={ __( 'Business and eCommerce plan sites' ) } initialOpen={ false }>
				<p>Body txt: lorem ipsum dolor sit amet</p>
			</PanelBody>
		</Panel>
	);
};

const BloggerPanelInfo: React.FunctionComponent< DetailsProps > = () => {
	const { __ } = useI18n();

	return (
		<Panel>
			<PanelBody title={ __( 'Export from Blogger' ) } initialOpen={ false }>
				<p>Body txt: lorem ipsum dolor sit amet</p>
			</PanelBody>
			<PanelBody title={ __( 'Import to WordPress.com' ) } initialOpen={ false }>
				<p>Body txt: lorem ipsum dolor sit amet</p>
			</PanelBody>
		</Panel>
	);
};

const ImportPlatformDetails: React.FunctionComponent< DetailsProps > = ( data ) => {
	const { __ } = useI18n();
	const { platform, onClose } = data;

	const getTitle = ( _platform: string ): string => {
		switch ( _platform ) {
			case 'Wix':
				return __( 'Importing content from Wix' );
			case 'Squarespace':
				return __( 'Importing content from Squarespace' );
			case 'Blogger':
				return __( 'Importing content from Blogger' );
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
			default:
				return '';
		}
	};

	return (
		<Modal
			className="import__details-modal"
			title={ getTitle( platform ) }
			onRequestClose={ onClose }
		>
			<div className="import__details-modal-content">
				<p>{ getInfo( platform ) }</p>

				<BackButton>{ __( 'Learn more' ) }</BackButton>

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

				{ ( () => {
					switch ( platform ) {
						case 'Wix':
							return <WixPanelInfo { ...data } />;
						case 'Squarespace':
							return <SquarespacePanelInfo { ...data } />;
						case 'Blogger':
							return <BloggerPanelInfo { ...data } />;
						default:
							return null;
					}
				} )() }
			</div>
		</Modal>
	);
};

export default ImportPlatformDetails;
