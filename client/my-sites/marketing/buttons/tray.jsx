/**
 * External dependencies
 */

import { assign, filter, find } from 'lodash';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import SortableList from 'components/forms/sortable-list';
import ButtonsPreviewButtons from './preview-buttons';
import ButtonsPreviewButton from './preview-button';

class SharingButtonsTray extends React.Component {
	static displayName = 'SharingButtonsTray';

	static propTypes = {
		buttons: PropTypes.array,
		style: PropTypes.oneOf( [ 'icon-text', 'icon', 'text', 'official' ] ),
		visibility: PropTypes.oneOf( [ 'visible', 'hidden' ] ),
		onButtonsChange: PropTypes.func,
		onButtonChange: PropTypes.func,
		onClose: PropTypes.func,
		active: PropTypes.bool,
		limited: PropTypes.bool,
	};

	static defaultProps = {
		buttons: [],
		style: 'icon',
		visibility: 'visible',
		onButtonsChange: function () {},
		onButtonChange: function () {},
		onClose: function () {},
		active: false,
		limited: false,
	};

	state = {
		isReordering: false,
	};

	UNSAFE_componentWillUpdate( nextProps ) {
		if ( this.props.visibility !== nextProps.visibility ) {
			this.setState( { isReordering: false } );
		}
	}

	getHeadingText = () => {
		if ( 'visible' === this.props.visibility ) {
			return this.props.translate( 'Edit visible buttons', {
				context: 'Sharing: Buttons editor heading',
			} );
		}
		return this.props.translate( 'Edit “More” buttons', {
			context: 'Sharing: Buttons editor heading',
		} );
	};

	getInstructionText = () => {
		const labels = {
			touch: this.props.translate( 'Tap the buttons you would like to add or remove.', {
				textOnly: true,
				context: 'Sharing: Buttons editor instructions',
			} ),
			notouch: this.props.translate( 'Click the buttons you would like to add or remove.', {
				textOnly: true,
				context: 'Sharing: Buttons editor instructions',
			} ),
			'touch-reorder': this.props.translate(
				'Tap the button you would like to move. Then tap the desired arrow.',
				{ textOnly: true, context: 'Sharing: Buttons editor instructions' }
			),
			'notouch-reorder': this.props.translate( 'Drag and drop to reorder the buttons.', {
				textOnly: true,
				context: 'Sharing: Buttons editor instructions',
			} ),
		};

		return Object.keys( labels ).map( function ( context ) {
			let label = labels[ context ];

			if ( 'hidden' === this.props.visibility ) {
				label +=
					' ' +
					this.props.translate( 'These will be shown in a dropdown under the “More” button.', {
						textOnly: true,
						context: 'Sharing: Buttons editor instructions',
					} );
			}

			return (
				<span
					key={ context }
					className={ 'sharing-buttons-preview__panel-instruction-text is-' + context + '-context' }
				>
					{ label }
				</span>
			);
		}, this );
	};

	getButtonsOfCurrentVisibility = () => {
		return filter( this.props.buttons, { visibility: this.props.visibility } );
	};

	onButtonsReordered = ( order ) => {
		let buttons = [];

		this.getButtonsOfCurrentVisibility().forEach( function ( button, i ) {
			buttons[ order[ i ] ] = button;
		}, this );

		buttons = buttons.concat(
			this.props.buttons.filter( function ( button ) {
				return button.visibility !== this.props.visibility;
			}, this )
		);

		this.props.onButtonsChange( buttons );
	};

	onButtonClick = ( button ) => {
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
			visibility: this.props.visibility,
		} );

		if ( ! isEnabled ) {
			// If toggling from enabled to disabled, we should also remove any
			// visibility property that may have been added so that we can
			// detect and remove unchanged buttons from the save process
			delete button.visibility;
		}

		this.props.onButtonsChange( buttons );
	};

	toggleReorder = () => {
		this.setState( { isReordering: ! this.state.isReordering } );
	};

	getLimitedButtonsNoticeElement = () => {
		if ( this.props.limited ) {
			return (
				<em className="sharing-buttons-preview__panel-notice">
					{ this.props.translate( 'Sharing options are limited on private sites.', {
						context: 'Sharing: Buttons',
					} ) }
				</em>
			);
		}
	};

	getButtonElements = () => {
		if ( this.state.isReordering ) {
			const buttons = this.getButtonsOfCurrentVisibility().map( function ( button ) {
				return (
					<ButtonsPreviewButton key={ button.ID } button={ button } enabled={ true } style="text" />
				);
			}, this );

			return <SortableList onChange={ this.onButtonsReordered }>{ buttons }</SortableList>;
		}
		return (
			<ButtonsPreviewButtons
				buttons={ this.props.buttons }
				visibility={ this.props.visibility }
				style="text"
				showMore={ false }
				onButtonClick={ this.onButtonClick }
			/>
		);
	};

	render() {
		const classes = classNames(
			'sharing-buttons-preview__panel',
			'is-bottom',
			'sharing-buttons-tray',
			'buttons-' + this.props.visibility,
			{
				'is-active': this.props.active,
				'is-reordering': this.state.isReordering,
			}
		);

		return (
			<div className={ classes }>
				<div className="sharing-buttons-preview__panel-content">
					<h3 className="sharing-buttons-preview__panel-heading">{ this.getHeadingText() }</h3>
					<p className="sharing-buttons-preview__panel-instructions">
						{ this.getInstructionText() }
					</p>
					<div className="sharing-buttons-tray__buttons">{ this.getButtonElements() }</div>
					{ this.getLimitedButtonsNoticeElement() }
				</div>
				<footer className="sharing-buttons-preview__panel-actions">
					<button
						type="button"
						className="button sharing-buttons-preview__panel-action is-left"
						onClick={ this.toggleReorder }
						disabled={ this.getButtonsOfCurrentVisibility().length <= 1 }
					>
						{ this.state.isReordering
							? this.props.translate( 'Add / Remove' )
							: this.props.translate( 'Reorder' ) }
					</button>
					<button
						type="button"
						className="button sharing-buttons-preview__panel-action"
						onClick={ this.props.onClose }
					>
						{ this.props.translate( 'Close' ) }
					</button>
				</footer>
			</div>
		);
	}
}

export default localize( SharingButtonsTray );
