/**
 * External dependencies
 */
import { assign, filter, find } from 'lodash';
import { localize } from 'i18n-calypso';
import React from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import SortableList from 'components/forms/sortable-list';

import ButtonsPreviewButtons from './preview-buttons';
import ButtonsPreviewButton from './preview-button';

export default localize( React.createClass( {
	displayName: 'SharingButtonsTray',

	propTypes: {
		buttons: React.PropTypes.array,
		style: React.PropTypes.oneOf( [ 'icon-text', 'icon', 'text', 'official' ] ),
		visibility: React.PropTypes.oneOf( [ 'visible', 'hidden' ] ),
		onButtonsChange: React.PropTypes.func,
		onButtonChange: React.PropTypes.func,
		onClose: React.PropTypes.func,
		active: React.PropTypes.bool,
		limited: React.PropTypes.bool
	},

	getInitialState: function() {
		return {
			isReordering: false
		};
	},

	componentWillUpdate: function( nextProps ) {
		if ( this.props.visibility !== nextProps.visibility ) {
			this.setState( { isReordering: false } );
		}
	},

	getDefaultProps: function() {
		return {
			buttons: [],
			style: 'icon',
			visibility: 'visible',
			onButtonsChange: function() {},
			onButtonChange: function() {},
			onClose: function() {},
			active: false,
			limited: false
		};
	},

	getHeadingText: function() {
		if ( 'visible' === this.props.visibility ) {
			return this.props.translate( 'Edit visible buttons', { context: 'Sharing: Buttons editor heading' } );
		} else {
			return this.props.translate( 'Edit “More” buttons', { context: 'Sharing: Buttons editor heading' } );
		}
	},

	getInstructionText: function() {
		const labels = {
			touch: this.props.translate( 'Tap the buttons you would like to add or remove.', { textOnly: true, context: 'Sharing: Buttons editor instructions' } ),
			notouch: this.props.translate( 'Click the buttons you would like to add or remove.', { textOnly: true, context: 'Sharing: Buttons editor instructions' } ),
			'touch-reorder': this.props.translate( 'Tap the button you would like to move. Then tap the desired arrow.', { textOnly: true, context: 'Sharing: Buttons editor instructions' } ),
			'notouch-reorder': this.props.translate( 'Drag and drop to reorder the buttons.', { textOnly: true, context: 'Sharing: Buttons editor instructions' } )
		};

		return Object.keys( labels ).map( function( context ) {
			let label = labels[ context ];

			if ( 'hidden' === this.props.visibility ) {
				label += ' ' + this.props.translate( 'These will be shown in a dropdown under the “More” button.', { textOnly: true, context: 'Sharing: Buttons editor instructions' } );
			}

			return <span key={ context } className={ 'sharing-buttons-preview__panel-instruction-text is-' + context + '-context' }>{ label }</span>;
		}, this );
	},

	getButtonsOfCurrentVisibility: function() {
		return filter( this.props.buttons, { visibility: this.props.visibility } );
	},

	onButtonsReordered: function( order ) {
		let buttons = [];

		this.getButtonsOfCurrentVisibility().forEach( function( button, i ) {
			buttons[ order[ i ] ] = button;
		}, this );

		buttons = buttons.concat( this.props.buttons.filter( function( button ) {
			return button.visibility !== this.props.visibility;
		}, this ) );

		this.props.onButtonsChange( buttons );
	},

	onButtonClick: function( button ) {
		let buttons = this.props.buttons.slice( 0 ),
			currentButton = find( buttons, { ID: button.ID } ),
			isEnabled;

		if ( button.visibility === this.props.visibility ) {
			// Assuming visibility hasn't changed, we can simply toggle the
			// current state
			isEnabled = ! button.enabled;
		} else {
			// Otherwise, the user is changing the button's current visibility
			// and we should allow it to remain enabled
			isEnabled = true;
		}

		assign( currentButton, {
			enabled: isEnabled,
			visibility: this.props.visibility
		} );

		if ( ! isEnabled ) {
			// If toggling from enabled to disabled, we should also remove any
			// visibility property that may have been added so that we can
			// detect and remove unchanged buttons from the save process
			delete button.visibility;
		}

		this.props.onButtonsChange( buttons );
	},

	toggleReorder: function() {
		this.setState( { isReordering: ! this.state.isReordering } );
	},

	getLimitedButtonsNoticeElement: function() {
		if ( this.props.limited ) {
			return (
			    <em className="sharing-buttons-preview__panel-notice">
					{ this.props.translate( 'Sharing options are limited on private sites.', {
						context: 'Sharing: Buttons'
					} ) }
				</em>
			);
		}
	},

	getButtonElements: function() {
		if ( this.state.isReordering ) {
			const buttons = this.getButtonsOfCurrentVisibility().map( function( button ) {
				return <ButtonsPreviewButton key={ button.ID } button={ button } enabled={ true } style={ this.props.style } />;
			}, this );

			return <SortableList onChange={ this.onButtonsReordered }>{ buttons }</SortableList>;
		} else {
			return <ButtonsPreviewButtons buttons={ this.props.buttons } visibility={ this.props.visibility } style={ this.props.style } showMore={ false } onButtonClick={ this.onButtonClick } />;
		}
	},

	render: function() {
		const classes = classNames( 'sharing-buttons-preview__panel', 'is-bottom', 'sharing-buttons-tray', 'buttons-' + this.props.visibility, {
			'is-active': this.props.active,
			'is-reordering': this.state.isReordering
		} );

		return (
		    <div className={ classes }>
				<div className="sharing-buttons-preview__panel-content">
					<h3 className="sharing-buttons-preview__panel-heading">{ this.getHeadingText() }</h3>
					<p className="sharing-buttons-preview__panel-instructions">{ this.getInstructionText() }</p>
					<div className="sharing-buttons-tray__buttons">{ this.getButtonElements() }</div>
					{ this.getLimitedButtonsNoticeElement() }
				</div>
				<footer className="sharing-buttons-preview__panel-actions">
					<button type="button" className="button sharing-buttons-preview__panel-action is-left" onClick={ this.toggleReorder } disabled={ this.getButtonsOfCurrentVisibility().length <= 1 }>
						{ this.state.isReordering ? this.props.translate( 'Add / Remove' ) : this.props.translate( 'Reorder' ) }
					</button>
					<button type="button" className="button sharing-buttons-preview__panel-action" onClick={ this.props.onClose }>{ this.props.translate( 'Close' ) }</button>
				</footer>
			</div>
		);
	}
} ) );
