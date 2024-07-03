import { ScreenReaderText, Gridicon } from '@automattic/components';
import clsx from 'clsx';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import FormTextInput from 'calypso/components/forms/form-text-input';
import { withAddMedia } from 'calypso/data/media/with-add-media';
import { bumpStat } from 'calypso/lib/analytics/mc';
import { getEditorPostId } from 'calypso/state/editor/selectors';
import { clearMediaItemErrors } from 'calypso/state/media/actions';

import './upload-url.scss';

const noop = () => {};

class MediaLibraryUploadUrl extends Component {
	static propTypes = {
		className: PropTypes.string,
		site: PropTypes.object,
		onAddMedia: PropTypes.func,
		onClose: PropTypes.func,
		addMedia: PropTypes.func,
	};

	static defaultProps = {
		onAddMedia: noop,
		onClose: noop,
	};

	state = {
		value: '',
		isError: false,
	};

	upload = ( event ) => {
		event.preventDefault();

		const isError = ! event.target.checkValidity();
		this.setState( { isError } );

		if ( isError || ! this.props.site ) {
			return;
		}

		this.props.clearMediaItemErrors( this.props.site.ID );
		this.props.addMedia( this.state.value, this.props.site, this.props.postId );

		this.setState( { value: '', isError: false } );
		this.props.onAddMedia();
		this.props.onClose();
		bumpStat( 'editor_upload_via', 'url' );
	};

	onChange = ( event ) => {
		this.setState( {
			isError: false,
			value: event.target.value,
		} );
	};

	onKeyDown = ( event ) => {
		if ( event.key === 'Escape' ) {
			return this.props.onClose( event );
		}

		if ( event.key !== 'Enter' ) {
			return;
		}

		this.upload( event );
	};

	render() {
		const classes = clsx( 'media-library__upload-url', this.props.className );
		const { onClose, translate } = this.props;

		return (
			<form className={ classes } onSubmit={ this.upload } noValidate>
				<FormTextInput
					type="url"
					value={ this.state.value }
					placeholder="https://"
					onChange={ this.onChange }
					onKeyDown={ this.onKeyDown }
					isError={ this.state.isError }
					// eslint-disable-next-line jsx-a11y/no-autofocus
					autoFocus
					required
				/>

				<div className="media-library__upload-url-button-group">
					{ /* eslint-disable-next-line wpcalypso/jsx-classname-namespace */ }
					<button type="submit" className="button is-primary">
						{ translate( 'Upload', { context: 'verb' } ) }
					</button>

					<button type="button" className="media-library__upload-url-cancel" onClick={ onClose }>
						<ScreenReaderText>{ translate( 'Cancel' ) }</ScreenReaderText>
						<Gridicon icon="cross" />
					</button>
				</div>
			</form>
		);
	}
}

export default connect(
	( state ) => ( {
		postId: getEditorPostId( state ),
	} ),
	{ clearMediaItemErrors }
)( localize( withAddMedia( MediaLibraryUploadUrl ) ) );
