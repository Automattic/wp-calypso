/**
 * External dependencies
 */
import { Button } from '@wordpress/components';
import { Component, Fragment } from '@wordpress/element';
import { withGlobalEvents, compose } from '@wordpress/compose';
import { withSelect } from '@wordpress/data';
import { debounce, get, isNil } from 'lodash';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import Panel from './panel';

const initialState = {
	buttonStyle: {
		visibility: 'hidden',
	},
	isPanelOpen: false,
};

class TemplateUpdateConfirmationButton extends Component {
	constructor( props ) {
		super( props );
		this.onResize = debounce( this.onResize, 100 );
		this.state = initialState;
		this.onResize();
	}

	componentDidUpdate( props, prevProps ) {
		if ( props.isFullScreen !== prevProps.isFullScreen ) {
			// this ensures the button is repositioned properly when toggling fullscreen mode
			setTimeout( () => this.onResize(), 1 );
		}
	}

	getOriginalButton() {
		return document.querySelector( '.edit-post-header .editor-post-publish-button' );
	}

	onResize() {
		const originalButton = this.getOriginalButton();
		let { buttonStyle } = initialState;
		if ( isNil( originalButton ) || ! ( 'getBoundingClientRect' in originalButton ) ) {
			// if it's not there, might need a timeout to await it?
			return this.setState( { buttonStyle } );
		}
		const rect = originalButton.getBoundingClientRect();
		buttonStyle = {
			// height doesn't line up perfectly with default styles
			height: '33px',
			position: 'fixed',
			zIndex: '10001',
			top: rect.top,
			left: rect.x,
		};
		if ( ! window.matchMedia( '(min-width: 600px)' ).matches ) {
			buttonStyle.paddingLeft = '5px';
			buttonStyle.paddingRight = '5px';
		}
		this.setState( { buttonStyle } );
	}

	getHidingCss() {
		return `.edit-post-header .editor-post-publish-button {
			visibility: hidden !important;
		}`;
	}

	render() {
		if ( ! this.shouldRender() ) {
			return null;
		}
		const { isSaving, isSaveable, isPostSavingLocked, isPublishable } = this.props;
		const isButtonDisabled = isSaving || ! isSaveable || isPostSavingLocked || ! isPublishable;
		return (
			<Fragment>
				<Button
					onClick={ this.togglePanel }
					isPrimary
					isLarge
					style={ this.state.buttonStyle }
					disabled={ isButtonDisabled }
					isBusy={ this.isSaving }
				>
					{ __( 'Update' ) }
				</Button>
				{ this.state.isPanelOpen && (
					<Panel
						isBusy={ this.isSaving }
						onClose={ this.togglePanel }
						onSave={ this.onPublish }
						disabled={ isButtonDisabled }
					/>
				) }
				<style>{ this.getHidingCss() }</style>
			</Fragment>
		);
	}

	shouldRender() {
		const { isPublished, isPublishable, isSaveable } = this.props;
		if ( ! isPublished || ! isPublishable || ! isSaveable ) {
			return false;
		}
		return true;
	}

	onPublish = () => {
		this.togglePanel();
		this.getOriginalButton().click();
	};

	togglePanel = () => {
		this.setState( { isPanelOpen: ! this.state.isPanelOpen } );
	};
}

export default compose( [
	withSelect( select => {
		const {
			isSavingPost,
			isCurrentPostPublished,
			isEditedPostSaveable,
			isEditedPostPublishable,
			isPostSavingLocked,
			getCurrentPost,
		} = select( 'core/editor' );
		return {
			isSaving: isSavingPost(),
			isSaveable: isEditedPostSaveable(),
			isPostSavingLocked: isPostSavingLocked(),
			isPublishable: isEditedPostPublishable(),
			isPublished: isCurrentPostPublished(),
			hasPublishAction: get( getCurrentPost(), [ '_links', 'wp:action-publish' ], false ),
			isFullScreen: select( 'core/edit-post' ).isFeatureActive( 'fullscreenMode' ),
		};
	} ),
	withGlobalEvents( {
		resize: 'onResize',
	} ),
] )( TemplateUpdateConfirmationButton );
