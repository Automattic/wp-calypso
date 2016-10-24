/**
 * External depencencies
 */
import React, { Component, PropTypes } from 'react';
import ReactDom from 'react-dom';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import MediaMarkup from 'post-editor/media-modal/markup';
import Button from 'components/button';
import Dialog from 'components/dialog';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormTextInput from 'components/forms/form-text-input';

class EditorMediaAdvanced extends Component {
	constructor() {
		super( ...arguments );

		this.save = this.save.bind( this );
	}

	save() {
		const { media, appearance } = this.props.item;
		const markup = MediaMarkup.get( Object.assign( {}, media, {
			alt: ReactDom.findDOMNode( this.refs.alt ).value
		} ), appearance );

		this.props.insertMedia( markup );
	}

	render() {
		const { translate, visible, item, onClose } = this.props;

		const buttons = [
			<Button primary onClick={ this.save }>
				{ translate( 'Save' ) }
			</Button>
		];

		return (
			<Dialog { ...{ isVisible: visible, buttons, onClose } }>
				<form onSubmit={ this.save }>
					<FormFieldset>
						<FormLabel>
							{ translate( 'Alt text' ) }
							<FormTextInput
								ref="alt"
								defaultValue={ item.media.alt } />
						</FormLabel>
					</FormFieldset>
				</form>
			</Dialog>
		);
	}
}

EditorMediaAdvanced.propTypes = {
	translate: PropTypes.func,
	visible: PropTypes.bool,
	item: PropTypes.object,
	onClose: PropTypes.func,
	insertMedia: PropTypes.func
};

EditorMediaAdvanced.defaultProps = {
	onClose: () => {},
	insertMedia: () => {}
};

export default localize( EditorMediaAdvanced );
