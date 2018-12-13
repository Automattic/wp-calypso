/** @format */
/**
 * External dependencies
 */
import { BlockControls } from '@wordpress/editor';
import { Component, Fragment } from '@wordpress/element';
import {
	BaseControl,
	Button,
	IconButton,
	Placeholder,
	SelectControl,
	TextControl,
	Toolbar,
} from '@wordpress/components';

/**
 * Internal dependencies
 */
import VRImageSave from './save';
import { __ } from 'gutenberg/extensions/presets/jetpack/utils/i18n';

export default class VRImageEdit extends Component {
	constructor( props ) {
		super( props );

		this.state = {
			isEditing: ! ( props.attributes.url && props.attributes.view ),
		};
	}

	onEditClick = () => {
		this.setState( { isEditing: true } );
	};

	onPreviewClick = () => {
		this.setState( { isEditing: false } );
	};

	onChangeUrl = value => {
		this.props.setAttributes( { url: value.trim() } );
	};

	onChangeView = value => {
		this.props.setAttributes( { view: value } );
	};

	render() {
		const { attributes, className } = this.props;
		const { isEditing } = this.state;

		return (
			<Fragment>
				<BlockControls>
					<Toolbar>
						{ ! isEditing && (
							<IconButton
								className="components-toolbar__control"
								label={ __( 'Edit URL' ) }
								icon="edit"
								onClick={ this.onEditClick }
							/>
						) }
					</Toolbar>
				</BlockControls>

				{ attributes.url && attributes.view && isEditing === false ? (
					<VRImageSave attributes={ attributes } className={ className } />
				) : (
					<Placeholder
						key="placeholder"
						icon="format-image"
						label={ __( 'VR Image' ) }
						className={ className }
					>
						<TextControl
							type="url"
							label={ __( 'Enter URL to VR image' ) }
							value={ attributes.url }
							onChange={ this.onChangeUrl }
						/>
						<SelectControl
							label={ __( 'View Type' ) }
							value={ attributes.view }
							onChange={ this.onChangeView }
							options={ [
								{ label: '', value: '' },
								{ label: __( '360°' ), value: '360' },
								{ label: __( 'Cinema' ), value: 'cinema' },
							] }
						/>
						<BaseControl>
							<Button
								disabled={ ! attributes.url || ! attributes.view }
								isLarge
								onClick={ this.onPreviewClick }
								type="submit"
							>
								{ __( 'Preview' ) }
							</Button>
						</BaseControl>
					</Placeholder>
				) }
			</Fragment>
		);
	}
}
