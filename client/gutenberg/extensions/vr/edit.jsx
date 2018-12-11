/** @format */

/**
 * External dependencies
 */
import { Component, Fragment } from '@wordpress/element';
import { InspectorControls } from '@wordpress/editor';
import { PanelBody, Placeholder } from '@wordpress/components';

/**
 * Internal dependencies
 */
import JetpackPluginSidebar from 'gutenberg/extensions/presets/jetpack/editor-shared/jetpack-plugin-sidebar';
import VRImageForm from './form';
import VRImageSave from './save';
import { __ } from 'gutenberg/extensions/presets/jetpack/utils/i18n';

export default class VRImageEdit extends Component {
	renderSettingsPanel() {
		return <PanelBody title={ __( 'VR Image Settings' ) }>{ this.renderForm() }</PanelBody>;
	}

	renderForm() {
		const { attributes, setAttributes } = this.props;

		return <VRImageForm attributes={ attributes } setAttributes={ setAttributes } />;
	}

	render() {
		const { attributes, className, isSelected } = this.props;

		return (
			<Fragment>
				{ attributes.url && attributes.view ? (
					<VRImageSave attributes={ attributes } className={ className } />
				) : (
					<Placeholder
						key="placeholder"
						icon="format-image"
						label={ __( 'VR Image' ) }
						className={ className }
					>
						{ this.renderForm() }
					</Placeholder>
				) }

				{ isSelected && (
					<Fragment>
						<JetpackPluginSidebar>{ this.renderSettingsPanel() }</JetpackPluginSidebar>
						<InspectorControls>{ this.renderSettingsPanel() }</InspectorControls>
					</Fragment>
				) }
			</Fragment>
		);
	}
}
