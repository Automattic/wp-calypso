/**
 * External dependencies
 */
import React from 'react';
import noop from 'lodash/noop';
import classNames from 'classnames';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import analytics from 'lib/analytics';
import FormTextInput from 'components/forms/form-text-input';
import MediaActions from 'lib/media/actions';
import Gridicon from 'components/gridicon';
import { updateShortcodes } from 'state/shortcodes/actions';

const MediaLibraryUploadUrl = React.createClass( {
	propTypes: {
		site: React.PropTypes.object,
		onAddMedia: React.PropTypes.func,
		onClose: React.PropTypes.func,
		className: React.PropTypes.string
	},

	getInitialState() {
		return {
			value: '',
			isError: false
		};
	},

	getDefaultProps() {
		return {
			onAddMedia: noop,
			onClose: noop
		};
	},

	upload( event ) {
		var isError = ! event.target.checkValidity();

		this.setState( {
			isError: isError
		} );

		if ( isError || ! this.props.site ) {
			return;
		}

		MediaActions.clearValidationErrors( this.props.site.ID );
		MediaActions.add( this.props.site.ID, this.state.value, this.props.updateShortcodes );

		this.replaceState( this.getInitialState() );
		this.props.onAddMedia();
		this.props.onClose();
		analytics.mc.bumpStat( 'editor_upload_via', 'url' );
		event.preventDefault();
	},

	onChange( event ) {
		this.setState( {
			value: event.target.value,
			isError: false
		} );
	},

	onKeyDown( event ) {
		if ( event.key !== 'Enter' ) {
			return;
		}

		this.upload( event );
	},

	render() {
		const classes = classNames( 'media-library__upload-url', this.props.className );

		return (
			<form className={ classes } onSubmit={ this.upload }>
				<FormTextInput
					type="url"
					value={ this.state.value }
					placeholder="https://"
					onChange={ this.onChange }
					onKeyDown={ this.onKeyDown }
					isError={ this.state.isError }
					autoFocus
					required />
				<div className="media-library__upload-url-button-group">
					<button type="submit" className="button is-primary">
						{ this.translate( 'Upload', { context: 'verb' } ) }
					</button>
					<button type="button" className="media-library__upload-url-cancel" onClick={ this.props.onClose }>
						<span className="screen-reader-text">
							{ this.translate( 'Cancel' ) }
						</span>
						<Gridicon icon="cross" />
					</button>
				</div>
			</form>
		);
	}
} );

export default connect(
	null,
	{
		updateShortcodes
	}
)( MediaLibraryUploadUrl );
