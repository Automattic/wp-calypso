import { Dialog, FormLabel } from '@automattic/components';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormTextInput from 'calypso/components/forms/form-text-input';

export class AddImageDialog extends Component {
	static propTypes = {
		onClose: PropTypes.func,
		onInsert: PropTypes.func,
		shouldDisplay: PropTypes.bool,
		translate: PropTypes.func,
	};

	state = {
		imageAlt: '',
		imageTitle: '',
		imageUrl: '',
	};

	setImageAlt = ( event ) => this.setState( { imageAlt: event.target.value } );

	setImageTitle = ( event ) => this.setState( { imageTitle: event.target.value } );

	setImageUrl = ( event ) => this.setState( { imageUrl: event.target.value } );

	closeDialog = () =>
		this.setState(
			{
				imageAlt: '',
				imageTitle: '',
				imageUrl: '',
			},
			this.props.onClose
		);

	insertImgTag = () => {
		const { imageAlt: alt, imageTitle: title, imageUrl: src } = this.state;
		this.props.onInsert( { alt, src, title } );
		this.closeDialog();
	};

	render() {
		const { shouldDisplay, translate } = this.props;
		const { imageAlt, imageTitle, imageUrl } = this.state;

		const buttons = [
			{
				action: 'cancel',
				label: translate( 'Cancel' ),
			},
			{
				action: 'add-image',
				isPrimary: true,
				label: translate( 'Add Image' ),
				onClick: this.insertImgTag,
			},
		];

		return (
			<Dialog
				isVisible={ shouldDisplay }
				buttons={ buttons }
				onClose={ this.closeDialog }
				additionalClassNames="comment-html-editor__dialog"
			>
				<FormFieldset>
					<FormLabel htmlFor="image_url">{ translate( 'URL' ) }</FormLabel>
					<FormTextInput name="image_url" onChange={ this.setImageUrl } value={ imageUrl } />
				</FormFieldset>
				<FormFieldset>
					<FormLabel htmlFor="image_title">{ translate( 'Title' ) }</FormLabel>
					<FormTextInput name="image_title" onChange={ this.setImageTitle } value={ imageTitle } />
				</FormFieldset>
				<FormFieldset>
					<FormLabel htmlFor="image_alt">{ translate( 'Alt Text' ) }</FormLabel>
					<FormTextInput name="image_alt" onChange={ this.setImageAlt } value={ imageAlt } />
				</FormFieldset>
			</Dialog>
		);
	}
}

export default localize( AddImageDialog );
