/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React from 'react';

/**
 * Internal dependencies
 */
import FormTextInput from 'components/forms/form-text-input';
import MediaActions from 'lib/media/actions';

export default localize( React.createClass( {
	displayName: 'EditorMediaModalGalleryCaption',

	propTypes: {
		siteId: PropTypes.number,
		item: PropTypes.object
	},

	getInitialState() {
		return {
			caption: null
		};
	},

	getValue() {
		if ( null !== this.state.caption ) {
			return this.state.caption;
		}

		if ( this.props.item ) {
			return this.props.item.caption;
		}
	},

	setCaption( event ) {
		this.setState( {
			caption: event.target.value
		} );
	},

	saveCaption() {
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
	},

	render() {
		return (
		    <FormTextInput
				value={ this.getValue() }
				placeholder={ this.props.translate( 'Caption this image…' ) }
				onChange={ this.setCaption }
				onBlur={ this.saveCaption }
				onMouseDown={ ( event ) => event.stopPropagation() }
				className="editor-media-modal-gallery__caption" />
		);
	}
} ) );
