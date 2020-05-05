/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import React from 'react';
import { connect } from 'react-redux';
import { noop, assign, omitBy, some, isEqual, partial } from 'lodash';

/**
 * Internal dependencies
 */
import HeaderCake from 'components/header-cake';
import MediaStore from 'lib/media/store';
import EditorMediaModalContent from '../content';
import EditorMediaModalGalleryDropZone from './drop-zone';
import EditorMediaModalGalleryFields from './fields';
import EditorMediaModalGalleryPreview from './preview';
import { GalleryDefaultAttrs } from 'lib/media/constants';
import { ModalViews } from 'state/ui/media-modal/constants';
import { setEditorMediaModalView } from 'state/ui/editor/actions';
import { isModuleActive } from 'lib/site/utils';

/**
 * Style dependencies
 */
import './style.scss';

class EditorMediaModalGallery extends React.Component {
	static propTypes = {
		site: PropTypes.object,
		items: PropTypes.array,
		settings: PropTypes.object,
		onUpdateSettings: PropTypes.func,
		onReturnToList: PropTypes.func,
	};

	static defaultProps = {
		onUpdateSettings: noop,
	};

	state = {
		invalidItemDropped: false,
	};

	UNSAFE_componentWillMount() {
		if ( this.props.settings ) {
			this.maybeUpdateColumnsSetting();
			this.reconcileSettingsItems( this.props.settings, this.props.items );
		} else {
			this.setDefaultSettings();
		}
	}

	componentDidUpdate( prevProps ) {
		if ( ! this.props.settings ) {
			return;
		}

		this.maybeUpdateColumnsSetting();

		if ( ! isEqual( prevProps.items, this.props.items ) ) {
			this.reconcileSettingsItems( this.props.settings, this.props.items );
		}
	}

	reconcileSettingsItems = ( settings, items ) => {
		// Reconcile by ensuring that all items saved to settings still exist
		// in the original set, and that any items since added to the original
		// set are similarly appended to the settings set.
		// Finally, make sure that all items are the latest version
		const newItems = settings.items
			.filter( ( item ) => {
				return some( items, { ID: item.ID } );
			} )
			.concat(
				items.filter( ( item ) => {
					return ! some( settings.items, { ID: item.ID } );
				} )
			)
			.map( ( item ) => {
				return MediaStore.get( this.props.site.ID, item.ID );
			} );

		if ( ! isEqual( newItems, settings.items ) ) {
			this.updateSetting( 'items', newItems );
		}
	};

	maybeUpdateColumnsSetting = () => {
		// if the number of columns currently set is higher
		// than the number of available items
		// then revert the setting to the number of items
		if ( this.props.items.length < this.props.settings.columns ) {
			this.updateSetting( 'columns', this.props.items.length );
		}
	};

	setDefaultSettings = () => {
		const { site, settings, items, onUpdateSettings } = this.props;

		if ( settings ) {
			return;
		}

		const defaultSettings = assign( {}, GalleryDefaultAttrs, { items } );

		if ( site && ( ! site.jetpack || isModuleActive( site, 'tiled-gallery' ) ) ) {
			defaultSettings.type = 'rectangular';
		}

		onUpdateSettings( defaultSettings );
	};

	updateSetting = ( setting, value ) => {
		if ( 'string' === typeof setting ) {
			// Normalize singular value
			setting = { [ setting ]: value };
		}

		// Merge object of settings with existing set
		let updatedSettings = assign( {}, this.props.settings, setting );
		updatedSettings = omitBy( updatedSettings, ( updatedValue ) => null === updatedValue );
		this.props.onUpdateSettings( updatedSettings );
	};

	render() {
		const { site, items, settings } = this.props;

		return (
			<div className="editor-media-modal-gallery">
				<EditorMediaModalGalleryDropZone
					site={ site }
					onInvalidItemAdded={ () => this.setState( { invalidItemDropped: true } ) }
				/>
				<HeaderCake
					onClick={ this.props.onReturnToList }
					backText={ this.props.translate( 'Media Library' ) }
				/>
				<EditorMediaModalContent className="editor-media-modal-gallery__content">
					<EditorMediaModalGalleryPreview
						site={ site }
						items={ items }
						settings={ settings }
						onUpdateSetting={ this.updateSetting }
						invalidItemDropped={ this.state.invalidItemDropped }
						onDismissInvalidItemDropped={ () => this.setState( { invalidItemDropped: false } ) }
					/>
					<div className="editor-media-modal-gallery__sidebar">
						<EditorMediaModalGalleryFields
							site={ site }
							settings={ settings }
							onUpdateSetting={ this.updateSetting }
							numberOfItems={ items.length }
						/>
					</div>
				</EditorMediaModalContent>
			</div>
		);
	}
}

export default connect( null, {
	onReturnToList: partial( setEditorMediaModalView, ModalViews.LIST ),
} )( localize( EditorMediaModalGallery ) );
