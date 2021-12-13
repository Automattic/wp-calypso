import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import FormTextInput from 'calypso/components/forms/form-text-input';
import { withUpdateMedia } from 'calypso/data/media/with-update-media';

class EditorMediaModalGalleryCaption extends Component {
	static displayName = 'EditorMediaModalGalleryCaption';

	static propTypes = {
		siteId: PropTypes.number,
		item: PropTypes.object,
	};

	state = {
		caption: null,
	};

	getValue = () => {
		if ( null !== this.state.caption ) {
			return this.state.caption;
		}

		if ( this.props.item ) {
			return this.props.item.caption;
		}
	};

	setCaption = ( event ) => {
		this.setState( {
			caption: event.target.value,
		} );
	};

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

		this.props.updateMedia( siteId, item.ID, { caption } );
	};

	render() {
		return (
			<FormTextInput
				value={ this.getValue() }
				placeholder={ this.props.translate( 'Caption this image…' ) }
				onChange={ this.setCaption }
				onBlur={ this.saveCaption }
				onMouseDown={ ( event ) => event.stopPropagation() }
				// eslint-disable-next-line wpcalypso/jsx-classname-namespace
				className="editor-media-modal-gallery__caption"
			/>
		);
	}
}

export default localize( withUpdateMedia( EditorMediaModalGalleryCaption ) );
