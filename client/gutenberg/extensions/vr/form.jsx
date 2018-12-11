/** @format */

/**
 * External dependencies
 */
import { Component, Fragment } from '@wordpress/element';
import { SelectControl, TextControl } from '@wordpress/components';

/**
 * Internal dependencies
 */
import { __ } from 'gutenberg/extensions/presets/jetpack/utils/i18n';

export default class VRImageForm extends Component {
	onChangeUrl = value => void this.props.setAttributes( { url: value.trim() } );

	onChangeView = value => void this.props.setAttributes( { view: value } );

	render() {
		const { attributes } = this.props;

		return (
			<Fragment>
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
			</Fragment>
		);
	}
}
