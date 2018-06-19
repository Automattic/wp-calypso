/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { noop, values as objectValues } from 'lodash';
import { localize } from 'i18n-calypso';
import Gridicon from 'gridicons';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import PopoverMenu from 'components/popover/menu';
import PopoverMenuItem from 'components/popover/menu-item';
import { AspectRatios, MinimumImageDimensions } from 'state/ui/editor/image-editor/constants';
import { getImageEditorAspectRatio } from 'state/ui/editor/image-editor/selectors';
import {
	imageEditorRotateCounterclockwise,
	imageEditorFlip,
	setImageEditorAspectRatio,
} from 'state/ui/editor/image-editor/actions';
import getImageEditorIsGreaterThanMinimumDimensions from 'state/selectors/get-image-editor-is-greater-than-minimum-dimensions';

export class ImageEditorToolbar extends Component {
	static propTypes = {
		aspectRatio: PropTypes.string,
		imageEditorRotateCounterclockwise: PropTypes.func,
		imageEditorFlip: PropTypes.func,
		setImageEditorAspectRatio: PropTypes.func,
		allowedAspectRatios: PropTypes.array,
		onShowNotice: PropTypes.func,
		isAspectRatioDisabled: PropTypes.bool,
	};

	static defaultProps = {
		imageEditorRotateCounterclockwise: noop,
		imageEditorFlip: noop,
		setImageEditorAspectRatio: noop,
		allowedAspectRatios: objectValues( AspectRatios ),
		onShowNotice: noop,
		isAspectRatioDisabled: false,
	};

	constructor( props ) {
		super( props );

		this.state = {
			showAspectPopover: false,
		};

		this.setAspectMenuContext = this.setAspectMenuContext.bind( this );
		this.onAspectOpen = this.onAspectOpen.bind( this );
		this.onAspectClose = this.onAspectClose.bind( this );
		this.rotate = this.rotate.bind( this );
		this.flip = this.flip.bind( this );
	}

	rotate() {
		this.props.imageEditorRotateCounterclockwise();
	}

	flip() {
		this.props.imageEditorFlip();
	}

	onAspectOpen( event ) {
		event.preventDefault();

		const { isAspectRatioDisabled, onShowNotice, translate } = this.props;

		if ( isAspectRatioDisabled ) {
			const noticeText = translate(
				'To change the aspect ratio, the height and width must be bigger than {{strong}}%(width)dpx{{/strong}}.',
				{
					args: {
						width: MinimumImageDimensions.WIDTH,
						height: MinimumImageDimensions.HEIGHT,
					},
					components: {
						strong: <strong />,
					},
				}
			);
			onShowNotice( noticeText );
			return;
		}

		this.setState( { showAspectPopover: true } );
	}

	onAspectClose( action ) {
		this.setState( { showAspectPopover: false } );

		if ( typeof action === 'string' ) {
			this.props.setImageEditorAspectRatio( action );
		}
	}

	setAspectMenuContext( popoverContext ) {
		this.setState( { popoverContext } );
	}

	renderAspectMenu() {
		const { popoverContext, showAspectPopover } = this.state;

		const { translate, aspectRatio, allowedAspectRatios } = this.props;

		if ( ! popoverContext || allowedAspectRatios.length === 1 ) {
			return;
		}

		const items = [
			{
				action: AspectRatios.FREE,
				label: translate( 'Free' ),
			},
			{
				action: AspectRatios.ORIGINAL,
				label: translate( 'Original' ),
			},
			{
				action: AspectRatios.ASPECT_1X1,
				label: translate( 'Square' ),
			},
			{
				action: AspectRatios.ASPECT_16X9,
				label: translate( '16:9' ),
			},
			{
				action: AspectRatios.ASPECT_4X3,
				label: translate( '4:3' ),
			},
			{
				action: AspectRatios.ASPECT_3X2,
				label: translate( '3:2' ),
			},
		];

		return (
			<PopoverMenu
				isVisible={ showAspectPopover }
				onClose={ this.onAspectClose }
				position="top"
				context={ popoverContext }
				className="image-editor__toolbar-popover popover is-dialog-visible"
			>
				{ items.map(
					item =>
						allowedAspectRatios.indexOf( item.action ) !== -1 ? (
							<PopoverMenuItem
								key={ 'image-editor-toolbar-aspect-' + item.action }
								action={ item.action }
							>
								{ aspectRatio === item.action ? <Gridicon icon="checkmark" size={ 12 } /> : false }
								{ item.label }
							</PopoverMenuItem>
						) : null
				) }
			</PopoverMenu>
		);
	}

	renderButtons() {
		const { translate, allowedAspectRatios, isAspectRatioDisabled } = this.props;

		const buttons = [
			{
				tool: 'rotate',
				icon: 'rotate',
				text: translate( 'Rotate' ),
				onClick: this.rotate,
			},
			allowedAspectRatios.length === 1
				? null
				: {
						tool: 'aspect',
						ref: this.setAspectMenuContext,
						icon: 'crop',
						text: translate( 'Crop' ),
						onClick: this.onAspectOpen,
						disabled: isAspectRatioDisabled,
				  },
			{
				tool: 'flip-vertical',
				icon: 'flip-vertical',
				text: translate( 'Flip' ),
				onClick: this.flip,
			},
		];

		return buttons.map( button => {
			const buttonClasses = classNames( 'image-editor__toolbar-button', {
				'is-disabled': button && button.disabled,
			} );
			return button ? (
				<button
					key={ 'image-editor-toolbar-' + button.tool }
					ref={ button.ref }
					className={ buttonClasses }
					onClick={ button.onClick }
				>
					<Gridicon icon={ button.icon } />
					<span>{ button.text }</span>
				</button>
			) : null;
		} );
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
	state => {
		const aspectRatio = getImageEditorAspectRatio( state );
		const isGreaterThanMinimumDimensions = getImageEditorIsGreaterThanMinimumDimensions( state );

		return {
			aspectRatio,
			isAspectRatioDisabled: ! isGreaterThanMinimumDimensions,
		};
	},
	{
		imageEditorRotateCounterclockwise,
		imageEditorFlip,
		setImageEditorAspectRatio,
	}
)( localize( ImageEditorToolbar ) );
