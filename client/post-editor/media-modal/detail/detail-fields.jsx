/**
 * External dependencies
 */
import ReactDom from 'react-dom';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { debounce, get } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { gaRecordEvent } from 'lib/analytics/ga';
import { bumpStat } from 'lib/analytics/mc';
import { getMimePrefix, url } from 'lib/media/utils';
import MediaActions from 'lib/media/actions';
import ClipboardButtonInput from 'components/clipboard-button-input';
import FormTextarea from 'components/forms/form-textarea';
import FormTextInput from 'components/forms/form-text-input';
import TrackInputChanges from 'components/track-input-changes';
import EditorMediaModalFieldset from '../fieldset';

class EditorMediaModalDetailFields extends Component {
	static propTypes = {
		site: PropTypes.object,
		item: PropTypes.object,
	};

	constructor() {
		super( ...arguments );
		this.persistChange = debounce( this.persistChange, 1000 );
	}

	UNSAFE_componentWillReceiveProps( nextProps ) {
		if ( this.props.item && nextProps.item && nextProps.item.ID !== this.props.item.ID ) {
			this.setState( { modifiedItem: null } );
			this.persistChange.cancel();
		}
	}

	bumpTitleStat = () => {
		gaRecordEvent( 'Media', 'Changed Item Title' );
		bumpStat( 'calypso_media_edit_details', 'title' );
	};

	bumpAltStat = () => {
		gaRecordEvent( 'Media', 'Changed Image Alt' );
		bumpStat( 'calypso_media_edit_details', 'alt' );
	};

	bumpCaptionStat = () => {
		gaRecordEvent( 'Media', 'Changed Item Caption' );
		bumpStat( 'calypso_media_edit_details', 'caption' );
	};

	bumpDescriptionStat = () => {
		gaRecordEvent( 'Media', 'Changed Item Description' );
		bumpStat( 'calypso_media_edit_details', 'description' );
	};

	isMimePrefix( prefix ) {
		return getMimePrefix( this.props.item ) === prefix;
	}

	persistChange() {
		if ( ! this.props.site || ! this.state.modifiedItem ) {
			return;
		}

		MediaActions.update( this.props.site.ID, this.state.modifiedItem );
	}

	setFieldValue = ( { target } ) => {
		const modifiedItem = Object.assign(
			{ ID: this.props.item.ID },
			get( this.state, 'modifiedItem', {} ),
			{ [ target.name ]: target.value }
		);

		this.setState( { modifiedItem } );
		this.persistChange();
	};

	getItemValue( attribute ) {
		const modifiedValue = get( this.state, [ 'modifiedItem', attribute ], null );
		if ( modifiedValue !== null ) {
			return modifiedValue;
		}

		if ( this.props.item ) {
			return this.props.item[ attribute ];
		}
	}

	scrollToShowVisibleDropdown = event => {
		if ( ! event.open || ! ( 'scrollIntoView' in window.Element.prototype ) ) {
			return;
		}

		ReactDom.findDOMNode( event.target ).scrollIntoView();
	};

	renderImageAltText() {
		if ( ! this.isMimePrefix( 'image' ) ) {
			return null;
		}

		return (
			<EditorMediaModalFieldset legend={ this.props.translate( 'Alt text' ) }>
				<TrackInputChanges onNewValue={ this.bumpAltStat }>
					<FormTextInput
						name="alt"
						value={ this.getItemValue( 'alt' ) }
						onChange={ this.setFieldValue }
					/>
				</TrackInputChanges>
			</EditorMediaModalFieldset>
		);
	}

	render() {
		const { translate } = this.props;
		return (
			<div className="editor-media-modal-detail__fields">
				<EditorMediaModalFieldset legend={ translate( 'Title' ) }>
					<TrackInputChanges onNewValue={ this.bumpTitleStat }>
						<FormTextInput
							name="title"
							value={ this.getItemValue( 'title' ) }
							onChange={ this.setFieldValue }
						/>
					</TrackInputChanges>
				</EditorMediaModalFieldset>

				<EditorMediaModalFieldset legend={ translate( 'Caption' ) }>
					<TrackInputChanges onNewValue={ this.bumpCaptionStat }>
						<FormTextarea
							name="caption"
							value={ this.getItemValue( 'caption' ) }
							onChange={ this.setFieldValue }
						/>
					</TrackInputChanges>
				</EditorMediaModalFieldset>

				{ this.renderImageAltText() }

				<EditorMediaModalFieldset legend={ translate( 'Description' ) }>
					<TrackInputChanges onNewValue={ this.bumpDescriptionStat }>
						<FormTextarea
							name="description"
							value={ this.getItemValue( 'description' ) }
							onChange={ this.setFieldValue }
						/>
					</TrackInputChanges>
				</EditorMediaModalFieldset>

				<EditorMediaModalFieldset legend={ translate( 'URL' ) }>
					<ClipboardButtonInput value={ url( this.props.item ) } />
				</EditorMediaModalFieldset>
			</div>
		);
	}
}

export default localize( EditorMediaModalDetailFields );
