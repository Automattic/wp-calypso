/**
 * External dependencies
 */
import { __ } from '../../utils/i18n';
import { BlockControls } from '@wordpress/editor';
import { Component, Fragment } from '@wordpress/element';
import { Placeholder, ToggleControl } from '@wordpress/components';

/**
 * Internal dependencies
 */
import FormatPicker from './format-picker';
import { AD_FORMATS } from './constants';
import { icon, title } from './';

import './editor.scss';

class WordAdsEdit extends Component {
	handleHideMobileChange = hideMobile => {
		this.props.setAttributes( { hideMobile: !! hideMobile } );
	};

	render() {
		const { attributes, setAttributes } = this.props;
		const { format, hideMobile } = attributes;
		const selectedFormatObject = AD_FORMATS.filter( ( { tag } ) => tag === format )[ 0 ];

		return (
			<Fragment>
				<BlockControls>
					<FormatPicker
						value={ format }
						onChange={ nextFormat => setAttributes( { format: nextFormat } ) }
					/>
				</BlockControls>
				<div className={ `wp-block-jetpack-wordads jetpack-wordads-${ format }` }>
					<div
						className="jetpack-wordads__ad"
						style={ {
							width: selectedFormatObject.width,
							height: selectedFormatObject.height + selectedFormatObject.editorPadding,
						} }
					>
						<Placeholder icon={ icon } label={ title } />
						<ToggleControl
							checked={ Boolean( hideMobile ) }
							label={ __( 'Hide ad on mobile views' ) }
							onChange={ this.handleHideMobileChange }
						/>
					</div>
				</div>
			</Fragment>
		);
	}
}
export default WordAdsEdit;
