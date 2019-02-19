/**
 * External dependencies
 */
import { __ } from 'gutenberg/extensions/presets/jetpack/utils/i18n';
import classNames from 'classnames';
import { Component } from '@wordpress/element';
import { Placeholder, SelectControl } from '@wordpress/components';

/**
 * Internal dependencies
 */
import { icon, title } from './';
import { AD_FORMATS } from './constants';
import './editor.scss';

class WordAdsEdit extends Component {
	render() {
		const { attributes, isSelected, setAttributes } = this.props;
		const { align, format: selectedFormat } = attributes;
		const classes = classNames(
			'wp-block-jetpack-wordads',
			`align${ align }`,
			'jetpack-wordads-' + selectedFormat,
			{
				'is-selected': isSelected,
			}
		);
		const selectedFormatObject = AD_FORMATS.filter( format => format.tag === selectedFormat )[ 0 ];

		return (
			<div className={ classes }>
				<div
					className="jetpack-wordads__ad"
					style={ { width: selectedFormatObject.width, height: selectedFormatObject.height + 30 } }
				>
					{ ! isSelected && (
						<div className="jetpack-wordads__header">{ __( 'Advertisements' ) }</div>
					) }
					<Placeholder icon={ icon } label={ title }>
						{ isSelected && (
							<SelectControl
								label={ __( 'Format' ) }
								onChange={ newFormat => setAttributes( { format: newFormat } ) }
								options={ AD_FORMATS.map( format => ( {
									label: format.name,
									value: format.tag,
								} ) ) }
								value={ selectedFormat }
							/>
						) }
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
