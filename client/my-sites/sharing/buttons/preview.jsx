/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import { filter, some } from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';

/**
 * Internal dependencies
 */
import ButtonsLabelEditor from './label-editor';
import ButtonsPreviewAction from './preview-action';
import ButtonsPreviewButtons from './preview-buttons';
import ButtonsTray from './tray';
import analytics from 'lib/analytics';
import { decodeEntities } from 'lib/formatting';

export default localize( React.createClass( {
	displayName: 'SharingButtonsPreview',

	propTypes: {
		isPrivateSite: PropTypes.bool,
		style: PropTypes.oneOf( [ 'icon-text', 'icon', 'text', 'official' ] ),
		label: PropTypes.string,
		buttons: PropTypes.array,
		showLike: PropTypes.bool,
		showReblog: PropTypes.bool,
		onLabelChange: PropTypes.func,
		onButtonsChange: PropTypes.func
	},

	getInitialState: function() {
		return {
			isEditingLabel: false,
			buttonsTrayVisibility: null
		};
	},

	getDefaultProps: function() {
		return {
			style: 'icon',
			buttons: [],
			showLike: true,
			showReblog: true,
			onLabelChange: function() {},
			onButtonsChange: function() {}
		};
	},

	toggleEditLabel: function() {
		const isEditingLabel = ! this.state.isEditingLabel;
		this.setState( { isEditingLabel: isEditingLabel } );

		if ( isEditingLabel ) {
			this.hideButtonsTray();
			analytics.ga.recordEvent( 'Sharing', 'Clicked Edit Text Link' );
		} else {
			analytics.ga.recordEvent( 'Sharing', 'Clicked Edit Text Done Button' );
		}
	},

	showButtonsTray: function( visibility ) {
		this.setState( {
			isEditingLabel: false,
			buttonsTrayVisibility: visibility
		} );

		analytics.ga.recordEvent( 'Sharing', 'Clicked Edit Buttons Links', visibility );
	},

	hideButtonsTray: function() {
		if ( ! this.state.buttonsTrayVisibility ) {
			return;
		}

		// Hide button tray by resetting state to default
		this.setState( { buttonsTrayVisibility: null } );

		analytics.ga.recordEvent( 'Sharing', 'Clicked Edit Buttons Done Button' );
	},

	getButtonsTrayToggleButtonLabel: function( visibility, enabledButtonsExist ) {
		if ( 'visible' === visibility ) {
			if ( enabledButtonsExist ) {
				return this.props.translate( 'Edit sharing buttons', { context: 'Sharing: Buttons edit label' } );
			} else {
				return this.props.translate( 'Add sharing buttons', { context: 'Sharing: Buttons edit label' } );
			}
		} else if ( enabledButtonsExist ) {
			return this.props.translate( 'Edit “More” buttons', { context: 'Sharing: Buttons edit label' } );
		}

		return this.props.translate( 'Add “More” button', { context: 'Sharing: Buttons edit label' } );
	},

	getButtonsTrayToggleButtonElement: function( visibility ) {
		const enabledButtonsExist = some( this.props.buttons, {
			visibility: visibility,
			enabled: true
		} );

		return (
			<ButtonsPreviewAction
				active={ null === this.state.buttonsTrayVisibility }
				onClick={ this.showButtonsTray.bind( null, visibility ) }
				icon={ enabledButtonsExist ? 'pencil' : 'plus' }
				position="bottom-left">
					{ this.getButtonsTrayToggleButtonLabel( visibility, enabledButtonsExist ) }
			</ButtonsPreviewAction>
		);
	},

	getReblogButtonElement: function() {
		if ( this.props.showReblog ) {
			return (
			    <a className="sharing-buttons-preview-button is-enabled style-icon-text sharing-buttons-preview__reblog">
					<span className="noticon noticon-reblog" />{ this.props.translate( 'Reblog' ) }
				</a>
			);
		}
	},

	getLikeButtonElement: function() {
		if ( this.props.showLike ) {
			return (
			    <span>
					<a className="sharing-buttons-preview-button is-enabled style-icon-text sharing-buttons-preview__like">
						<span className="noticon noticon-like" />{ this.props.translate( 'Like' ) }
					</a>
					<div className="sharing-buttons-preview__fake-user">
						<img src="https://1.gravatar.com/avatar/767fc9c115a1b989744c755db47feb60" />
					</div>
					<div className="sharing-buttons-preview__fake-like">{ this.props.translate( 'One blogger likes this.' ) }</div>
				</span>
			);
		}
	},

	getPreviewButtonsElement: function() {
		const enabledButtons = filter( this.props.buttons, { enabled: true } );

		if ( enabledButtons.length ) {
			return (
				<ButtonsPreviewButtons
					buttons={ enabledButtons }
					visibility="visible"
					style={ this.props.style }
					showMore={ 'hidden' === this.state.buttonsTrayVisibility || some( this.props.buttons, { visibility: 'hidden' } ) }
					forceMorePreviewVisible={ 'hidden' === this.state.buttonsTrayVisibility } />
			);
		}
	},

	render: function() {
		return (
		    <div className="sharing-buttons-preview">
				<ButtonsPreviewAction active={ ! this.state.isEditingLabel } onClick={ this.toggleEditLabel } icon="pencil" position="top-left">
					{ this.props.translate( 'Edit label text', { context: 'Sharing: Buttons edit label' } ) }
				</ButtonsPreviewAction>
				<ButtonsLabelEditor
					active={ this.state.isEditingLabel }
					value={ this.props.label }
					onChange={ this.props.onLabelChange }
					onClose={ this.toggleEditLabel }
					hasEnabledButtons={ some( this.props.buttons, { enabled: true } ) } />

				<h2 className="sharing-buttons-preview__heading">{ this.props.translate( 'Preview' ) }</h2>
				<div className="sharing-buttons-preview__display">
					<span className="sharing-buttons-preview__label">{ decodeEntities( this.props.label ) }</span>
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
					limited={ this.props.isPrivateSite } />
			</div>
		);
	}
} ) );
