/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import { assign, fromPairs, includes, noop, times } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import EditorMediaModalFieldset from '../fieldset';
import SelectDropdown from 'components/select-dropdown';
import FormCheckbox from 'components/forms/form-checkbox';
import { GalleryColumnedTypes, GallerySizeableTypes } from 'lib/media/constants';
import { isModuleActive } from 'lib/site/utils';

export class EditorMediaModalGalleryFields extends React.Component {
	static propTypes = {
		site: PropTypes.object,
		settings: PropTypes.object,
		onUpdateSetting: PropTypes.func,
		numberOfItems: PropTypes.number,
	};

	static defaultProps = {
		settings: Object.freeze( {} ),
		onUpdateSetting: noop,
		numberOfItems: 0,
	};

	getTypeOptions = () => {
		const { site } = this.props;

		const options = {
			individual: this.props.translate( 'Individual Images' ),
			default: this.props.translate( 'Thumbnail Grid' ),
		};

		if ( site && ( ! site.jetpack || isModuleActive( site, 'tiled-gallery' ) ) ) {
			assign( options, {
				rectangular: this.props.translate( 'Tiled Mosaic' ),
				square: this.props.translate( 'Square Tiles' ),
				circle: this.props.translate( 'Circles' ),
				columns: this.props.translate( 'Tiled Columns' ),
			} );
		}

		if ( site && ( ! site.jetpack || isModuleActive( site, 'shortcodes' ) ) ) {
			assign( options, {
				slideshow: this.props.translate( 'Slideshow' ),
			} );
		}

		return options;
	};

	getLinkOptions = () => {
		if ( 'individual' === this.props.settings.type ) {
			return {};
		}

		return {
			'': this.props.translate( 'Attachment Page' ),
			file: this.props.translate( 'Media File' ),
			none: this.props.translate( 'None' ),
		};
	};

	getSizeOptions = () => {
		if ( ! includes( GallerySizeableTypes, this.props.settings.type ) ) {
			return {};
		}

		return {
			thumbnail: this.props.translate( 'Thumbnail' ),
			medium: this.props.translate( 'Medium' ),
			large: this.props.translate( 'Large' ),
			full: this.props.translate( 'Full Size' ),
		};
	};

	getColumnOptions = () => {
		const max = Math.min( this.props.numberOfItems, 9 );
		return fromPairs( times( max, ( n ) => [ n + 1, ( n + 1 ).toString() ] ) );
	};

	updateRandomOrder = ( event ) => {
		this.props.onUpdateSetting( 'orderBy', event.target.checked ? 'rand' : null );
	};

	renderDropdown = ( legend, options, settingName ) => {
		const { settings, onUpdateSetting } = this.props;

		if ( ! Object.keys( options ).length ) {
			return;
		}

		return (
			<EditorMediaModalFieldset legend={ legend } className={ 'for-setting-' + settingName }>
				<SelectDropdown selectedText={ options[ settings[ settingName ] ] }>
					{ Object.keys( options ).map( ( value ) => {
						const label = options[ value ];

						return (
							<SelectDropdown.Item
								key={ 'value-' + value }
								selected={ value === settings[ settingName ] }
								onClick={ () =>
									onUpdateSetting( settingName, isFinite( parseInt( value ) ) ? +value : value )
								}
							>
								{ label }
							</SelectDropdown.Item>
						);
					} ) }
				</SelectDropdown>
			</EditorMediaModalFieldset>
		);
	};

	renderColumnsOption = () => {
		if ( ! includes( GalleryColumnedTypes, this.props.settings.type ) ) {
			return;
		}

		return this.renderDropdown(
			this.props.translate( 'Columns' ),
			this.getColumnOptions(),
			'columns'
		);
	};

	renderRandomOption = () => {
		const { settings } = this.props;

		if ( 'individual' === settings.type ) {
			return;
		}

		return (
			<EditorMediaModalFieldset legend={ this.props.translate( 'Random Order' ) }>
				<FormCheckbox onChange={ this.updateRandomOrder } checked={ settings.orderBy === 'rand' } />
			</EditorMediaModalFieldset>
		);
	};

	render() {
		const types = this.getTypeOptions();
		const links = this.getLinkOptions();
		const sizes = this.getSizeOptions();

		return (
			<div className="editor-media-modal-gallery__fields">
				{ this.renderDropdown( this.props.translate( 'Layout' ), types, 'type' ) }
				{ this.renderColumnsOption() }
				{ this.renderRandomOption() }
				{ this.renderDropdown( this.props.translate( 'Link To' ), links, 'link' ) }
				{ this.renderDropdown( this.props.translate( 'Size' ), sizes, 'size' ) }
			</div>
		);
	}
}

export default localize( EditorMediaModalGalleryFields );
