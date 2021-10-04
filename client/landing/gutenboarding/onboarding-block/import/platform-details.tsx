import { BackButton } from '@automattic/onboarding';
import { Modal, Panel, PanelBody } from '@wordpress/components';
import { createElement, createInterpolateElement } from '@wordpress/element';
import { Icon, close, check } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import * as React from 'react';

interface DetailsProps {
	platform: string;
	onClose: () => void;
}

const WixDetails: React.FunctionComponent< DetailsProps > = () => {
	const { __ } = useI18n();

	return (
		<div className="import__details-modal-content">
			<p>
				{ __(
					"Our Wix content importer is the quickest way to move your content. Simply click 'Import your content' and provide your site's web address (called a URL). Once the import is complete, you'll have a site that's pre-filled with your content."
				) }
			</p>

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

			<Panel>
				<PanelBody title={ __( 'Import to a new site' ) } initialOpen={ false }>
					<p>Body txt: lorem ipsum dolor sit amet</p>
				</PanelBody>
				<PanelBody title={ __( 'Import to an existing site' ) } initialOpen={ false }>
					<p>Body txt: lorem ipsum dolor sit amet</p>
				</PanelBody>
			</Panel>
		</div>
	);
};

const ImportPlatformDetails: React.FunctionComponent< DetailsProps > = ( data ) => {
	const { __ } = useI18n();
	const { platform, onClose } = data;

	const getTitle = ( _platform: string ): string => {
		switch ( _platform ) {
			case 'Wix':
				return __( 'Importing content from Wix' );
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
			{ ( () => {
				switch ( platform ) {
					case 'Wix':
						return <WixDetails { ...data } />;
					default:
						return null;
				}
			} )() }
		</Modal>
	);
};

export default ImportPlatformDetails;
