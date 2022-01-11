import classnames from 'classnames';
import { localize } from 'i18n-calypso';
import { debounce } from 'lodash';
import PropTypes from 'prop-types';
import { Component } from 'react';
import ReactDom from 'react-dom';
import ClipboardButtonInput from 'calypso/components/clipboard-button-input';
import FormLabel from 'calypso/components/forms/form-label';
import FormRadio from 'calypso/components/forms/form-radio';
import FormTextInput from 'calypso/components/forms/form-text-input';
import FormTextarea from 'calypso/components/forms/form-textarea';
import TrackInputChanges from 'calypso/components/track-input-changes';
import { withUpdateMedia } from 'calypso/data/media/with-update-media';
import { FormCheckbox } from 'calypso/devdocs/design/playground-scope';
import { gaRecordEvent } from 'calypso/lib/analytics/ga';
import { bumpStat } from 'calypso/lib/analytics/mc';
import { getMimePrefix, url } from 'calypso/lib/media/utils';
import EditorMediaModalFieldset from '../fieldset';

const noop = () => {};

class EditorMediaModalDetailFields extends Component {
	static propTypes = {
		site: PropTypes.object,
		item: PropTypes.object,
		onUpdate: PropTypes.func,
	};

	static defaultProps = {
		onUpdate: noop,
	};

	constructor( props ) {
		super( props );

		// Save changes to server after 1 second delay
		this.delayedSaveChange = debounce( this.saveChange, 1000 );
		this.state = {
			modifiedChanges: null,
		};
	}

	// @TODO: Please update https://github.com/Automattic/wp-calypso/issues/58453 if you are refactoring away from UNSAFE_* lifecycle methods!
	UNSAFE_componentWillReceiveProps( nextProps ) {
		if ( nextProps.item && nextProps.item.ID !== this.props.item?.ID ) {
			this.updateChange( true );
			this.setState( { modifiedChanges: null } );
		}
	}

	componentWillUnmount() {
		this.updateChange( true );
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

	updateChange( saveImmediately = false ) {
		const siteId = this.props.site?.ID;
		const itemId = this.props.item?.ID;
		const modifiedChanges = this.state.modifiedChanges;
		const hasChanges = siteId && itemId && modifiedChanges;

		if ( ! hasChanges ) {
			return;
		}

		// Update changes to local state immediately
		this.props.onUpdate( itemId, modifiedChanges );

		// Save changes immediately or after a delay
		if ( saveImmediately ) {
			this.saveChange( siteId, itemId, modifiedChanges );
		} else {
			this.delayedSaveChange( siteId, itemId, modifiedChanges );
		}
	}

	saveChange( siteId, mediaId, modifiedChanges ) {
		this.props.updateMedia( siteId, mediaId, modifiedChanges );
	}

	setFieldByName = ( name, value ) => {
		this.setState(
			( state ) => ( {
				modifiedChanges: { ...state.modifiedChanges, [ name ]: value },
			} ),
			this.updateChange
		);
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

	handleAllowDownloadOption = () => {
		const inputValue = '1' === this.getItemValue( 'allow_download' ) ? '0' : '1';

		this.setFieldByName( 'allow_download', inputValue );
	};

	getItemValue( attribute ) {
		return this.state.modifiedChanges?.[ attribute ] ?? this.props.item?.[ attribute ];
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
		];
		let rating = this.getItemValue( 'rating' );
		if ( ! rating ) {
			return;
		}

		// X-18 was previously supported but is now removed to better comply with our TOS.
		if ( 'X-18' === rating ) {
			rating = 'R-17';
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
							'Display share menu and allow viewers to copy a link or embed this video'
						) }
					</span>
				</FormLabel>
			</EditorMediaModalFieldset>
		);
	};

	renderAllowDownloadOption = () => {
		// Make sure this is actually a VideoPress video
		const videopressGuid = this.getItemValue( 'videopress_guid' );
		if ( ! videopressGuid ) {
			return;
		}

		const allowDownloadKey = 'allow_download';
		let allowDownload = this.getItemValue( allowDownloadKey );
		if ( undefined === allowDownload ) {
			allowDownload = 0;
		}

		return (
			<EditorMediaModalFieldset legend={ this.props.translate( 'Download' ) }>
				<FormLabel>
					<FormCheckbox
						id={ allowDownloadKey }
						name={ allowDownloadKey }
						checked={ allowDownload === '1' }
						onChange={ this.handleAllowDownloadOption }
					/>
					<span>
						{ this.props.translate(
							'Display download option and allow viewers to download this video'
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
				{ this.renderAllowDownloadOption() }
				{ this.renderRating() }
				{ this.renderVideoPressShortcode() }
			</div>
		);
	}
}

export default localize( withUpdateMedia( EditorMediaModalDetailFields ) );
