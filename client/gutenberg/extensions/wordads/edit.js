/**
 * External dependencies
 */
import { __ } from 'gutenberg/extensions/presets/jetpack/utils/i18n';
import classNames from 'classnames';
import { Component } from '@wordpress/element';
import { PanelBody, Placeholder, SelectControl } from '@wordpress/components';
import { InspectorControls } from '@wordpress/editor';

/**
 * Internal dependencies
 */
import { icon, title } from './';
import { AD_FORMATS } from './constants';
import './editor.scss';

class WordAdsEdit extends Component {
	render() {
		const { attributes, className, isSelected, setAttributes } = this.props;
		const { align, format: selectedFormat } = attributes;
		const classes = classNames( className, `align${ align }`, 'jetpack-wordads-' + selectedFormat, {
			'is-selected': isSelected,
		} );
		const selectedFormatObject = AD_FORMATS.filter( format => format.tag === selectedFormat )[ 0 ];
		const formatSelector = (
			<SelectControl
				label={ __( 'Format' ) }
				onChange={ newFormat => setAttributes( { format: newFormat } ) }
				options={ AD_FORMATS.map( format => ( { label: format.name, value: format.tag } ) ) }
				value={ selectedFormat }
			/>
		);

		return (
			<div className={ classes }>
				<InspectorControls>
					<PanelBody>{ formatSelector }</PanelBody>
				</InspectorControls>
				<div
					className="jetpack-wordads__ad"
					style={ { width: selectedFormatObject.width, height: selectedFormatObject.height + 30 } }
				>
					{ ! isSelected && (
						<div className="jetpack-wordads__header">{ __( 'Advertisements' ) }</div>
					) }
					<Placeholder icon={ icon } label={ title }>
						{ isSelected && formatSelector }
					</Placeholder>
					{ ! isSelected && (
						<div className="jetpack-wordads__footer">{ __( 'Report this Ad' ) }</div>
					) }
				</div>
			</div>
		);
	}
}
export default WordAdsEdit;
