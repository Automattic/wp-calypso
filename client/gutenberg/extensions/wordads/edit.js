/**
 * External dependencies
 */
import { __ } from 'gutenberg/extensions/presets/jetpack/utils/i18n';
import classNames from 'classnames';
import { Component } from '@wordpress/element';
import { PanelBody, Placeholder, SelectControl } from '@wordpress/components';
import { InspectorControls } from '@wordpress/editor';

const AD_FORMATS = [
	{
		name: __( 'Rectangle 300x250' ),
		tag: '300x250_mediumrectangle',
		height: 250,
		width: 300,
	},
	{
		name: __( 'Leaderboard 728x90' ),
		tag: '728x90_leaderboard',
		height: 90,
		width: 728,
	},
	{
		name: __( 'Mobile Leaderboard 320x50' ),
		tag: '320x50_mobileleaderboard',
		height: 50,
		width: 320,
	},
	{
		name: __( 'Wide Skyscraper 160x600' ),
		tag: '160x600_wideskyscraper',
		height: 600,
		width: 160,
	},
];
/**
 * Internal dependencies
 */
import { icon, title } from './';
import './editor.scss';

class WordAdEdit extends Component {
	render() {
		const { attributes, className, isSelected, setAttributes } = this.props;
		const { align, format: selectedFormat } = attributes;
		const classes = classNames( className, `align${ align }`, 'jetpack-' );
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
			<div
				className={ classes }
				style={ { width: selectedFormatObject.width, height: selectedFormatObject.height + 30 } }
			>
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
export default WordAdEdit;
