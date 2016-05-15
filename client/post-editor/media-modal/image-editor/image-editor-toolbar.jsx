/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import noop from 'lodash/noop';

/**
 * Internal dependencies
 */
import Gridicon from 'components/gridicon';
import PopoverMenu from 'components/popover/menu';
import PopoverMenuItem from 'components/popover/menu-item';
import { AspectRatios } from 'state/ui/editor/image-editor/constants';
import {
	getImageEditorAspectRatio,
} from 'state/ui/editor/image-editor/selectors';
import {
	imageEditorRotateCounterclockwise,
	imageEditorFlip,
	setImageEditorAspectRatio
} from 'state/ui/editor/image-editor/actions';

const MediaModalImageEditorToolbar = React.createClass( {
	displayName: 'MediaModalImageEditorToolbar',

	propTypes: {
		aspectRatio: React.PropTypes.string,
		imageEditorRotateCounterclockwise: React.PropTypes.func,
		imageEditorFlip: React.PropTypes.func,
		setImageEditorAspectRatio: React.PropTypes.func
	},

	getDefaultProps() {
		return {
			imageEditorRotateCounterclockwise: noop,
			imageEditorFlip: noop,
			setImageEditorAspectRatio: noop
		};
	},

	getInitialState() {
		return {
			showAspectPopover: false
		};
	},

	rotate() {
		this.props.imageEditorRotateCounterclockwise();
	},

	flip() {
		this.props.imageEditorFlip();
	},

	onAspectOpen( event ) {
		event.preventDefault();
		this.setState( { showAspectPopover: true } );
	},

	onAspectClose( action ) {
		this.setState( { showAspectPopover: false } );

		if ( 'string' === typeof action ) {
			this.props.setImageEditorAspectRatio( action );
		}
	},

	setAspectMenuContext( popoverContext ) {
		this.setState( { popoverContext } );
	},

	renderAspectMenu() {
		if ( ! this.state.popoverContext ) {
			return;
		}

		const items = [
			{
				action: AspectRatios.FREE,
				label: this.translate( 'Free' )
			},
			{
				action: AspectRatios.ORIGINAL,
				label: this.translate( 'Original' )
			},
			{
				action: AspectRatios.ASPECT_1X1,
				label: this.translate( 'Square' )
			},
			{
				action: AspectRatios.ASPECT_16X9,
				label: this.translate( '16:9' )
			},
			{
				action: AspectRatios.ASPECT_4X3,
				label: this.translate( '4:3' )
			},
			{
				action: AspectRatios.ASPECT_3X2,
				label: this.translate( '3:2' )
			}
		];

		return (
			<PopoverMenu isVisible={ this.state.showAspectPopover }
					onClose={ this.onAspectClose }
					position="top"
					context={ this.state.popoverContext }
					className="popover is-dialog-visible">
					{ items.map( item => (
						<PopoverMenuItem
							key={ 'image-editor-toolbar-aspect-' + item.action }
							action={ item.action }>
							{ this.props.aspectRatio === item.action ? <Gridicon icon="checkmark" size={ 14 }/> : false } { item.label }
						</PopoverMenuItem>
					) ) }
			</PopoverMenu>
		);
	},

	renderButtons() {
		const buttons = [
			{
				tool: 'rotate',
				icon: 'rotate',
				text: this.translate( 'Rotate' ),
				onClick: this.rotate
			},
			{
				tool: 'aspect',
				ref: this.setAspectMenuContext,
				icon: 'layout',
				text: this.translate( 'Aspect' ),
				onClick: this.onAspectOpen
			},
			{
				tool: 'flip-vertical',
				icon: 'flip-vertical',
				text: this.translate( 'Flip' ),
				onClick: this.flip
			}
		];

		return buttons.map( button => (
				<button
					key={ 'image-editor-toolbar-' + button.tool }
					ref={ button.ref }
					className={ 'editor-media-modal-image-editor__toolbar-button' }
					onClick={ button.onClick } >
					<Gridicon icon={ button.icon } size={ 36 } />
					<span>{ button.text }</span>
				</button>
			) );
	},

	render() {
		return (
			<div className="editor-media-modal-image-editor__toolbar">
				{ this.renderButtons() }
				{ this.renderAspectMenu() }
			</div>
		);
	}
} );

export default connect(
	state => ( {
		aspectRatio: getImageEditorAspectRatio( state )
	} ),
	{ imageEditorRotateCounterclockwise, imageEditorFlip, setImageEditorAspectRatio }
)( MediaModalImageEditorToolbar );
