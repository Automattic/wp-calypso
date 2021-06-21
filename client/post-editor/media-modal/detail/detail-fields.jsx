/**
 * External dependencies
 */
import ReactDom from 'react-dom';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { debounce, get, noop } from 'lodash';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { gaRecordEvent } from 'calypso/lib/analytics/ga';
import { bumpStat } from 'calypso/lib/analytics/mc';
import { getMimePrefix, url } from 'calypso/lib/media/utils';
import ClipboardButtonInput from 'calypso/components/clipboard-button-input';
import FormTextarea from 'calypso/components/forms/form-textarea';
import FormTextInput from 'calypso/components/forms/form-text-input';
import TrackInputChanges from 'calypso/components/track-input-changes';
import EditorMediaModalFieldset from '../fieldset';
import { updateMedia } from 'calypso/state/media/thunks';
import FormLabel from 'calypso/components/forms/form-label';
import { FormCheckbox } from 'calypso/devdocs/design/playground-scope';
import classnames from 'classnames';
import FormRadio from 'calypso/components/forms/form-radio';

class EditorMediaModalDetailFields extends Component {
	static propTypes = {
		site: PropTypes.object,
		item: PropTypes.object,
		onUpdate: PropTypes.func,
	};

	static defaultProps = {
		onUpdate: noop,
	};

	constructor() {
		super( ...arguments );
		this.persistChange = debounce( this._persistChange, 1000 );
	}

	UNSAFE_componentWillReceiveProps( nextProps ) {
		if ( nextProps.item && nextProps.item.ID !== this.props.item?.ID ) {
			this.persistChange.cancel();
			this._persistChange();
			this.setState( { modifiedItem: null } );
		}
	}

	componentWillUnmount() {
		this._persistChange();
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

	_persistChange() {
		if ( ! this.props.site || ! this.state?.modifiedItem ) {
			return;
		}

		this.props.updateMedia( this.props.site.ID, this.state.modifiedItem );
		this.props.onUpdate( this.props.item.ID, this.state.modifiedItem );
	}

	setFieldByName = ( name, value ) => {
		const modifiedItem = Object.assign(
			{ ID: this.props.item.ID },
			get( this.state, 'modifiedItem', {} ),
			{ [ name ]: value }
		);

		this.setState( { modifiedItem }, this.persistChange );
	};

	setFieldValue = ( { target } ) => {
		this.setFieldByName( target.name, target.value );
	};

	handleRatingChange = ( { currentTarget } ) => {
		this.setFieldByName( 'rating', currentTarget.value );
	};

	handleDisplayEmbed = () => {
		const inputValue = '1' === this.getItemValue( 'display_embed' ) ? '0' : '1';

		this.setFieldByName( 'display_embed', inputValue );
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

	scrollToShowVisibleDropdown = ( event ) => {
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

	renderVideoPressShortcode = () => {
		const videopressGuid = this.getItemValue( 'videopress_guid' );

		if ( ! videopressGuid ) {
			return;
		}

		return (
			<EditorMediaModalFieldset legend={ this.props.translate( 'Shortcode' ) }>
				<ClipboardButtonInput value={ '[wpvideo ' + videopressGuid + ']' } />
			</EditorMediaModalFieldset>
		);
	};

	renderRating = () => {
		const items = [
			{
				label: 'G',
				value: 'G',
			},
			{
				label: 'PG-13',
				value: 'PG-13',
			},
			{
				label: 'R',
				value: 'R-17',
			},
			{
				label: 'X',
				value: 'X-18',
			},
		];
		const rating = this.getItemValue( 'rating' );
		if ( ! rating ) {
			return;
		}

		return (
			<EditorMediaModalFieldset legend={ this.props.translate( 'Rating' ) }>
				<div className={ classnames( 'form-radios-bar' ) } style={ { display: 'flex' } }>
					{ items.map( ( item, i ) => (
						<FormLabel key={ item.value + i } style={ { paddingRight: '15px' } }>
							<FormRadio
								checked={ rating === item.value }
								onChange={ this.handleRatingChange }
								{ ...item }
							/>
						</FormLabel>
					) ) }
				</div>
			</EditorMediaModalFieldset>
		);
	};

	renderShareEmbed = () => {
		const share = this.getItemValue( 'display_embed' );
		if ( share === undefined ) {
			return;
		}

		return (
			<EditorMediaModalFieldset legend={ this.props.translate( 'Share' ) }>
				<FormLabel>
					<FormCheckbox
						id="display_embed"
						name="display_embed"
						checked={ share === '1' }
						onChange={ this.handleDisplayEmbed }
					/>
					<span>
						{ this.props.translate(
							'Display share menu and allow viewers to embed or download this video'
						) }
					</span>
				</FormLabel>
			</EditorMediaModalFieldset>
		);
	};

	render() {
		const { translate } = this.props;
		return (
			<div className="detail__fields editor-media-modal-detail__fields">
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

				<EditorMediaModalFieldset className="detail__url-field" legend={ translate( 'URL' ) }>
					<ClipboardButtonInput value={ url( this.props.item ) } />
				</EditorMediaModalFieldset>

				{ this.renderShareEmbed() }
				{ this.renderRating() }
				{ this.renderVideoPressShortcode() }
			</div>
		);
	}
}

export default localize( connect( null, { updateMedia } )( EditorMediaModalDetailFields ) );
