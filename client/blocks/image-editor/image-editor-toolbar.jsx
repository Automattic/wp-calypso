/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { noop } from 'lodash';
import { localize } from 'i18n-calypso';

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

class ImageEditorToolbar extends Component {
	static propTypes = {
		aspectRatio: PropTypes.string,
		imageEditorRotateCounterclockwise: PropTypes.func,
		imageEditorFlip: PropTypes.func,
		setImageEditorAspectRatio: PropTypes.func
	};

	static defaultProps = {
		imageEditorRotateCounterclockwise: noop,
		imageEditorFlip: noop,
		setImageEditorAspectRatio: noop
	};

	constructor( props ) {
		super( props );

		this.state = {
			showAspectPopover: false
		};
	}

	rotate() {
		this.props.imageEditorRotateCounterclockwise();
	}

	flip() {
		this.props.imageEditorFlip();
	}

	onAspectOpen( event ) {
		event.preventDefault();

		this.setState( { showAspectPopover: true } );
	}

	onAspectClose( action ) {
		this.setState( { showAspectPopover: false } );

		if ( 'string' === typeof action ) {
			this.props.setImageEditorAspectRatio( action );
		}
	}

	setAspectMenuContext( popoverContext ) {
		this.setState( { popoverContext } );
	}

	renderAspectMenu() {
		const {
			popoverContext,
			showAspectPopover
		} = this.state;

		if ( ! popoverContext ) {
			return;
		}

		const {
			translate,
			aspectRatio
		} = this.props;

		const items = [
			{
				action: AspectRatios.FREE,
				label: translate( 'Free' )
			},
			{
				action: AspectRatios.ORIGINAL,
				label: translate( 'Original' )
			},
			{
				action: AspectRatios.ASPECT_1X1,
				label: translate( 'Square' )
			},
			{
				action: AspectRatios.ASPECT_16X9,
				label: translate( '16:9' )
			},
			{
				action: AspectRatios.ASPECT_4X3,
				label: translate( '4:3' )
			},
			{
				action: AspectRatios.ASPECT_3X2,
				label: translate( '3:2' )
			}
		];

		return (
			<PopoverMenu isVisible={ showAspectPopover }
				onClose={ this.onAspectClose }
				position="top"
				context={ popoverContext }
				className="popover is-dialog-visible"
			>
				{ items.map( item => (
					<PopoverMenuItem
						key={ 'image-editor-toolbar-aspect-' + item.action }
						action={ item.action }>
						{
							aspectRatio === item.action
								? <Gridicon icon="checkmark" size={ 14 } />
								: false
						}
						{ item.label }
					</PopoverMenuItem>
				) ) }
			</PopoverMenu>
		);
	}

	renderButtons() {
		const { translate } = this.props;

		const buttons = [
			{
				tool: 'rotate',
				icon: 'rotate',
				text: translate( 'Rotate' ),
				onClick: this.rotate
			},
			{
				tool: 'aspect',
				ref: this.setAspectMenuContext,
				icon: 'layout',
				text: translate( 'Aspect' ),
				onClick: this.onAspectOpen
			},
			{
				tool: 'flip-vertical',
				icon: 'flip-vertical',
				text: translate( 'Flip' ),
				onClick: this.flip
			}
		];

		return buttons.map( button => (
			<button
				key={ 'image-editor-toolbar-' + button.tool }
				ref={ button.ref }
				className={ 'image-editor__toolbar-button' }
				onClick={ button.onClick }
			>
				<Gridicon icon={ button.icon } />
				<span>{ button.text }</span>
			</button>
		) );
	}

	render() {
		return (
			<div className="image-editor__toolbar">
				{ this.renderButtons() }
				{ this.renderAspectMenu() }
			</div>
		);
	}
}

export default connect(
	state => ( {
		aspectRatio: getImageEditorAspectRatio( state )
	} ),
	{
		imageEditorRotateCounterclockwise,
		imageEditorFlip,
		setImageEditorAspectRatio
	}
)( localize( ImageEditorToolbar ) );
