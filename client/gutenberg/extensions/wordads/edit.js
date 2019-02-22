/**
 * External dependencies
 */
import classNames from 'classnames';
import { __ } from 'gutenberg/extensions/presets/jetpack/utils/i18n';
import { BlockControls } from '@wordpress/editor';
import { Component, Fragment } from '@wordpress/element';
import { Placeholder } from '@wordpress/components';

/**
 * Internal dependencies
 */
import FormatPicker from './format-picker';
import { AD_FORMATS } from './constants';
import { icon, title } from './';

import './editor.scss';

class WordAdsEdit extends Component {
	render() {
		const { attributes, setAttributes } = this.props;
		const { align, format } = attributes;
		const classes = classNames( 'wp-block-jetpack-wordads', `jetpack-wordads-${ format }`, {
			[ `align${ align }` ]: align,
		} );
		const selectedFormatObject = AD_FORMATS.filter( ( { tag } ) => tag === format )[ 0 ];

		return (
			<Fragment>
				<BlockControls>
					<FormatPicker
						value={ format }
						onChange={ nextFormat => setAttributes( { format: nextFormat } ) }
					/>
				</BlockControls>
				<div className={ classes }>
					<div
						className="jetpack-wordads__ad"
						style={ {
							width: selectedFormatObject.width,
							height: selectedFormatObject.height + selectedFormatObject.editorPadding,
						} }
					>
						<div className="jetpack-wordads__header">{ __( 'Advertisements' ) }</div>
						<Placeholder icon={ icon } label={ title } />
						<div className="jetpack-wordads__footer">{ __( 'Report this Ad' ) }</div>
					</div>
				</div>
			</Fragment>
		);
	}
}
export default WordAdsEdit;
