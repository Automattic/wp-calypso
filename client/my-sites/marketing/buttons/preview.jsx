/**
 * External dependencies
 */
import { filter, some } from 'lodash';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Gridicon from 'components/gridicon';
import ButtonsLabelEditor from './label-editor';
import ButtonsPreviewButtons from './preview-buttons';
import ButtonsPreviewAction from './preview-action';
import ButtonsTray from './tray';
import { decodeEntities } from 'lib/formatting';
import analytics from 'lib/analytics';
import { gaRecordEvent } from 'lib/analytics/ga';
import getCurrentRouteParameterized from 'state/selectors/get-current-route-parameterized';
import { getSelectedSiteId } from 'state/ui/selectors';

class SharingButtonsPreview extends React.Component {
	static displayName = 'SharingButtonsPreview';

	static propTypes = {
		isPrivateSite: PropTypes.bool,
		style: PropTypes.oneOf( [ 'icon-text', 'icon', 'text', 'official' ] ),
		label: PropTypes.string,
		buttons: PropTypes.array,
		showLike: PropTypes.bool,
		showReblog: PropTypes.bool,
		onLabelChange: PropTypes.func,
		onButtonsChange: PropTypes.func,
	};

	static defaultProps = {
		style: 'icon',
		buttons: [],
		showLike: true,
		showReblog: true,
		onLabelChange: function() {},
		onButtonsChange: function() {},
	};

	state = {
		isEditingLabel: false,
		buttonsTrayVisibility: null,
	};

	toggleEditLabel = () => {
		const { path } = this.props;

		const isEditingLabel = ! this.state.isEditingLabel;
		this.setState( { isEditingLabel: isEditingLabel } );

		if ( isEditingLabel ) {
			this.hideButtonsTray();
			analytics.tracks.recordEvent( 'calypso_sharing_buttons_edit_text_click', { path } );
			gaRecordEvent( 'Sharing', 'Clicked Edit Text Link' );
		} else {
			analytics.tracks.recordEvent( 'calypso_sharing_buttons_edit_text_close_click', { path } );
			gaRecordEvent( 'Sharing', 'Clicked Edit Text Done Button' );
		}
	};

	showButtonsTray = visibility => {
		const { path } = this.props;

		this.setState( {
			isEditingLabel: false,
			buttonsTrayVisibility: visibility,
		} );

		if ( 'hidden' === visibility ) {
			analytics.tracks.recordEvent( 'calypso_sharing_buttons_more_button_click', { path } );
			gaRecordEvent( 'Sharing', 'Clicked More Button Link', visibility );
		} else {
			analytics.tracks.recordEvent( 'calypso_sharing_buttons_edit_button_click', { path } );
			gaRecordEvent( 'Sharing', 'Clicked Edit Button Link', visibility );
		}
	};

	hideButtonsTray = () => {
		const { path } = this.props;

		if ( ! this.state.buttonsTrayVisibility ) {
			return;
		}

		// Hide button tray by resetting state to default
		this.setState( { buttonsTrayVisibility: null } );

		analytics.tracks.recordEvent( 'calypso_sharing_buttons_edit_buttons_close_click', { path } );
		gaRecordEvent( 'Sharing', 'Clicked Edit Buttons Done Button' );
	};

	getButtonsTrayToggleButtonLabel = ( visibility, enabledButtonsExist ) => {
		if ( 'visible' === visibility ) {
			if ( enabledButtonsExist ) {
				return this.props.translate( 'Edit sharing buttons', {
					context: 'Sharing: Buttons edit label',
				} );
			}
			return this.props.translate( 'Add sharing buttons', {
				context: 'Sharing: Buttons edit label',
			} );
		} else if ( enabledButtonsExist ) {
			return this.props.translate( 'Edit “More” buttons', {
				context: 'Sharing: Buttons edit label',
			} );
		}

		return this.props.translate( 'Add “More” button', {
			context: 'Sharing: Buttons edit label',
		} );
	};

	getButtonsTrayToggleButtonElement = visibility => {
		const enabledButtonsExist = some( this.props.buttons, {
			visibility: visibility,
			enabled: true,
		} );

		return (
			<ButtonsPreviewAction
				active={ null === this.state.buttonsTrayVisibility }
				onClick={ this.showButtonsTray.bind( null, visibility ) }
				icon={ enabledButtonsExist ? 'pencil' : 'plus' }
				position="bottom-left"
			>
				{ this.getButtonsTrayToggleButtonLabel( visibility, enabledButtonsExist ) }
			</ButtonsPreviewAction>
		);
	};

	// 16 is used in the preview to match the buttons on the frontend of the website.
	getReblogButtonElement = () => {
		if ( this.props.showReblog ) {
			return (
				<a className="sharing-buttons-preview-button is-enabled style-icon-text sharing-buttons-preview__reblog">
					{ /* eslint-disable wpcalypso/jsx-gridicon-size */ }
					{ /* 16 is used in the preview to match the buttons on the frontend of the website. */ }
					<Gridicon icon="reblog" size={ 16 } />
					{ /* eslint-disable wpcalypso/jsx-gridicon-size */ }
					{ this.props.translate( 'Reblog' ) }
				</a>
			);
		}
	};

	getLikeButtonElement = () => {
		if ( this.props.showLike ) {
			return (
				<span>
					<a className="sharing-buttons-preview-button is-enabled style-icon-text sharing-buttons-preview__like">
						{ /* eslint-disable wpcalypso/jsx-gridicon-size */ }
						{ /* 16 is used in the preview to match the buttons on the frontend of the website. */ }
						<Gridicon icon="star" size={ 16 } />
						{ /* eslint-disable wpcalypso/jsx-gridicon-size */ }
						{ this.props.translate( 'Like' ) }
					</a>
					<div className="sharing-buttons-preview__fake-user">
						<img src="https://1.gravatar.com/avatar/767fc9c115a1b989744c755db47feb60" />
					</div>
					<div className="sharing-buttons-preview__fake-like">
						{ this.props.translate( 'One blogger likes this.' ) }
					</div>
				</span>
			);
		}
	};

	getPreviewButtonsElement = () => {
		const enabledButtons = filter( this.props.buttons, { enabled: true } );

		if ( enabledButtons.length ) {
			return (
				<ButtonsPreviewButtons
					buttons={ enabledButtons }
					visibility="visible"
					style={ this.props.style }
					showMore={
						'hidden' === this.state.buttonsTrayVisibility ||
						some( this.props.buttons, { visibility: 'hidden' } )
					}
					forceMorePreviewVisible={ 'hidden' === this.state.buttonsTrayVisibility }
				/>
			);
		}
	};

	render() {
		return (
			<div className="sharing-buttons-preview">
				<ButtonsPreviewAction
					active={ ! this.state.isEditingLabel }
					onClick={ this.toggleEditLabel }
					icon="pencil"
					position="top-left"
				>
					{ this.props.translate( 'Edit label text', {
						context: 'Sharing: Buttons edit label',
					} ) }
				</ButtonsPreviewAction>
				<ButtonsLabelEditor
					active={ this.state.isEditingLabel }
					value={ this.props.label }
					onChange={ this.props.onLabelChange }
					onClose={ this.toggleEditLabel }
					hasEnabledButtons={ some( this.props.buttons, { enabled: true } ) }
				/>

				<h2 className="sharing-buttons-preview__heading">{ this.props.translate( 'Preview' ) }</h2>
				<div className="sharing-buttons-preview__display">
					<span className="sharing-buttons-preview__label">
						{ decodeEntities( this.props.label ) }
					</span>
					<div className="sharing-buttons-preview__buttons">
						{ this.getPreviewButtonsElement() }
					</div>

					<div className="sharing-buttons-preview__reblog-like">
						{ this.getReblogButtonElement() }
						{ this.getLikeButtonElement() }
					</div>
				</div>

				<div className="sharing-buttons-preview__button-tray-actions">
					{ this.getButtonsTrayToggleButtonElement( 'visible' ) }
					{ this.getButtonsTrayToggleButtonElement( 'hidden' ) }
				</div>

				<ButtonsTray
					buttons={ this.props.buttons }
					style={ 'official' === this.props.style ? 'text' : this.props.style }
					visibility={ this.state.buttonsTrayVisibility }
					onButtonsChange={ this.props.onButtonsChange }
					onClose={ this.hideButtonsTray }
					active={ null !== this.state.buttonsTrayVisibility }
					limited={ this.props.isPrivateSite }
				/>
			</div>
		);
	}
}

export default connect( state => {
	return { path: getCurrentRouteParameterized( state, getSelectedSiteId( state ) ) };
} )( localize( SharingButtonsPreview ) );
