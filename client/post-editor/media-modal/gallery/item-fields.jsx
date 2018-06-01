/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import EditorMediaModalFieldset from '../fieldset';
import FormTextInput from 'components/forms/form-text-input';
import FormTextareaInput from 'components/forms/form-textarea';

export class EditorMediaModalGalleryItemFields extends React.Component {
	static propTypes = {
		translate: PropTypes.func,
		item: PropTypes.object,
		updateSetting: PropTypes.func,
		onBlur: PropTypes.func,
	};

	render() {
		const {
			translate: t,
			item: { URL, title, caption, alt, description },
			updateSetting: update,
			onBlur: blur,
		} = this.props;

		return (
			<div className="editor-media-modal-gallery__item-fields">
				<h3 className="editor-media-modal-gallery__item-heading">{ t( 'Attachment Details' ) }</h3>

				<EditorMediaModalFieldset legend={ t( 'URL' ) }>
					<FormTextInput value={ URL } onBlur={ blur } readOnly={ true } />
				</EditorMediaModalFieldset>

				<EditorMediaModalFieldset legend={ t( 'Title' ) }>
					<FormTextInput
						value={ title }
						onBlur={ blur }
						onChange={ e => update( 'title', e.target.value ) }
					/>
				</EditorMediaModalFieldset>

				<EditorMediaModalFieldset legend={ t( 'Caption' ) }>
					<FormTextareaInput
						value={ caption }
						onBlur={ blur }
						onChange={ e => update( 'caption', e.target.value ) }
					/>
				</EditorMediaModalFieldset>

				<EditorMediaModalFieldset legend={ t( 'Alt Text' ) }>
					<FormTextInput
						value={ alt }
						onBlur={ blur }
						onChange={ e => update( 'alt', e.target.value ) }
					/>
				</EditorMediaModalFieldset>

				<EditorMediaModalFieldset legend={ t( 'Description' ) }>
					<FormTextareaInput
						value={ description }
						onBlur={ blur }
						onChange={ e => update( 'description', e.target.value ) }
					/>
				</EditorMediaModalFieldset>
			</div>
		);
	}
}

export default localize( EditorMediaModalGalleryItemFields );
