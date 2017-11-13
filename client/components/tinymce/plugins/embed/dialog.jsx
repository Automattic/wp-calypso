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
import Button from 'components/button';
import Dialog from 'components/dialog';
import FormTextInput from 'components/forms/form-text-input';

/*
 * Shows the URL of am embed and allows it to be edited.
 */
export class EmbedDialog extends React.Component {
	static propTypes = {
		embedUrl: PropTypes.string,
		isVisible: PropTypes.bool,

		// Event handlers
		onCancel: PropTypes.func.isRequired,
		onUpdate: PropTypes.func.isRequired,

		// Inherited
		translate: PropTypes.func.isRequired,
	};

	static defaultProps = {
		embedUrl: '',
		isVisible: false,
	};

	state = {
		embedUrl: this.props.embedUrl,
	};

	/**
	 * Reset `state.embedUrl` whenever the component's dialog is opened or closed.
	 *
	 * If this were not done, then switching back and forth between multiple embeds would result in
	 * `state.embedUrl` being incorrect. For example, when the second embed was opened,
	 * `state.embedUrl` would equal the value of the first embed, since it initially set the
	 * state.
	 *
	 * @param {object} nextProps The properties that will be received.
	 */
	componentWillReceiveProps = nextProps => {
		this.setState( {
			embedUrl: nextProps.embedUrl,
		} );
	};

	onChangeEmbedUrl = event => {
		this.setState( { embedUrl: event.target.value } );
	};

	onUpdate = () => {
		this.props.onUpdate( this.state.embedUrl );
	};

	onKeyDownEmbedUrl = event => {
		if ( 'Enter' !== event.key ) {
			return;
		}

		event.preventDefault();
		this.onUpdate();
	};

	render() {
		const { translate } = this.props;
		const dialogButtons = [
			<Button onClick={ this.props.onCancel }>{ translate( 'Cancel' ) }</Button>,
			<Button primary onClick={ this.onUpdate }>
				{ translate( 'Update' ) }
			</Button>,
		];

		return (
			<Dialog
				autoFocus={ false }
				buttons={ dialogButtons }
				additionalClassNames="embed__modal"
				isVisible={ this.props.isVisible }
				onCancel={ this.props.onCancel }
				onClose={ this.props.onCancel }
			>
				<h3 className="embed__title">{ translate( 'Embed URL' ) }</h3>

				<FormTextInput
					autoFocus={ true }
					className="embed__url"
					defaultValue={ this.state.embedUrl }
					onChange={ this.onChangeEmbedUrl }
					onKeyDown={ this.onKeyDownEmbedUrl }
				/>
			</Dialog>
		);
	}
}

export default localize( EmbedDialog );
