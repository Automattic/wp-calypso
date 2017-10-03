/**
 * External dependencies
 */
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import MediaActions from 'lib/media/actions';
import FormTextInput from 'components/forms/form-text-input';

/* eslint-disable wpcalypso/jsx-classname-namespace */

class EditorMediaModalGalleryCaption extends Component {

	static propTypes = {
		siteId: PropTypes.number,
		item: PropTypes.object,
	};

	state = {
		caption: null,
	};

	getValue() {
		if ( null !== this.state.caption ) {
			return this.state.caption;
		}

		if ( this.props.item ) {
			return this.props.item.caption;
		}
	}

	setCaption = ( event ) =>
		this.setState( {
			caption: event.target.value
		} );

	saveCaption = () => {
		const { siteId, item } = this.props;
		if ( ! siteId || ! item ) {
			return;
		}

		// Avoid saving if caption value hasn't changed
		const caption = this.getValue();
		if ( item && caption === item.caption ) {
			return;
		}

		MediaActions.update( siteId, Object.assign( {}, item, { caption } ) );
	}

	render() {
		const { translate } = this.props;

		return (
			<FormTextInput
				value={ this.getValue() }
				placeholder={ translate( 'Caption this image…' ) }
				onChange={ this.setCaption }
				onBlur={ this.saveCaption }
				onMouseDown={ ( event ) => event.stopPropagation() }
				className="editor-media-modal-gallery__caption"
			/>
		);
	}
}

EditorMediaModalGalleryCaption.displayName = 'EditorMediaModalGalleryCaption';

export default localize( EditorMediaModalGalleryCaption );
