/**
 * External dependencies
 */
import classnames from 'classnames';
import { noop } from 'lodash';

/**
 * WordPress dependencies
 */
import { Component, createRef } from '@wordpress/element';
import deprecated from '@wordpress/deprecated';
import { focus } from '@wordpress/dom';
import { ESCAPE } from '@wordpress/keycodes';

/**
 * Internal dependencies
 */
import './style.scss';
import { computePopoverPosition } from './utils';
import withFocusReturn from '../higher-order/with-focus-return';
import withConstrainedTabbing from '../higher-order/with-constrained-tabbing';
import PopoverDetectOutside from './detect-outside';
import IconButton from '../icon-button';
import ScrollLock from '../scroll-lock';
import { Slot, Fill } from '../slot-fill';

const FocusManaged = withConstrainedTabbing( withFocusReturn( ( { children } ) => children ) );

/**
 * Name of slot in which popover should fill.
 *
 * @type {String}
 */
const SLOT_NAME = 'Popover';

class Popover extends Component {
	constructor() {
		super( ...arguments );

		this.focus = this.focus.bind( this );
		this.getAnchorRect = this.getAnchorRect.bind( this );
		this.updatePopoverSize = this.updatePopoverSize.bind( this );
		this.computePopoverPosition = this.computePopoverPosition.bind( this );
		this.throttledComputePopoverPosition = this.throttledComputePopoverPosition.bind( this );
		this.maybeClose = this.maybeClose.bind( this );

		this.contentNode = createRef();
		this.anchorNode = createRef();

		this.state = {
			popoverLeft: null,
			popoverTop: null,
			yAxis: 'top',
			xAxis: 'center',
			contentHeight: null,
			contentWidth: null,
			isMobile: false,
			popoverSize: null,
		};
	}

	componentDidMount() {
		this.toggleWindowEvents( true );
		this.refresh();
		this.focus();
	}

	componentDidUpdate( prevProps ) {
		if ( prevProps.position !== this.props.position ) {
			this.computePopoverPosition();
		}
	}

	componentWillUnmount() {
		this.toggleWindowEvents( false );
	}

	toggleWindowEvents( isListening ) {
		const handler = isListening ? 'addEventListener' : 'removeEventListener';

		window.cancelAnimationFrame( this.rafHandle );
		window[ handler ]( 'resize', this.throttledComputePopoverPosition );
		window[ handler ]( 'scroll', this.throttledComputePopoverPosition, true );
	}

	throttledComputePopoverPosition( event ) {
		if ( event.type === 'scroll' && this.contentNode.current.contains( event.target ) ) {
			return;
		}
		this.rafHandle = window.requestAnimationFrame( () => this.computePopoverPosition() );
	}

	refresh() {
		const popoverSize = this.updatePopoverSize();
		this.computePopoverPosition( popoverSize );
	}

	focus() {
		const { focusOnMount } = this.props;

		if ( focusOnMount === true ) {
			deprecated( 'focusOnMount={ true }', {
				version: '3.4',
				alternative: 'focusOnMount="firstElement"',
				plugin: 'Gutenberg',
			} );
		}

		if ( ! focusOnMount || ! this.contentNode.current ) {
			return;
		}

		// Without the setTimeout, the dom node is not being focused
		// Related https://stackoverflow.com/questions/35522220/react-ref-with-focus-doesnt-work-without-settimeout-my-example
		const focusNode = ( domNode ) => setTimeout( () => domNode.focus() );

		// Boolean values for focusOnMount deprecated in 3.2–remove
		// `focusOnMount === true` check in 3.4.
		if ( focusOnMount === 'firstElement' || focusOnMount === true ) {
			// Find first tabbable node within content and shift focus, falling
			// back to the popover panel itself.
			const firstTabbable = focus.tabbable.find( this.contentNode.current )[ 0 ];
			focusNode( firstTabbable ? firstTabbable : this.contentNode.current );

			return;
		}

		if ( focusOnMount === 'container' ) {
			// Focus the popover panel itself so items in the popover are easily
			// accessed via keyboard navigation.
			focusNode( this.contentNode.current );

			return;
		}

		window.console.warn( `<Popover> component: focusOnMount argument "${ focusOnMount }" not recognized.` );
	}

	getAnchorRect() {
		const anchor = this.anchorNode.current;
		if ( ! anchor || ! anchor.parentNode ) {
			return;
		}
		const rect = anchor.parentNode.getBoundingClientRect();
		// subtract padding
		const { paddingTop, paddingBottom } = window.getComputedStyle( anchor.parentNode );
		const topPad = parseInt( paddingTop, 10 );
		const bottomPad = parseInt( paddingBottom, 10 );
		return {
			x: rect.left,
			y: rect.top + topPad,
			width: rect.width,
			height: rect.height - topPad - bottomPad,
			left: rect.left,
			right: rect.right,
			top: rect.top + topPad,
			bottom: rect.bottom - bottomPad,
		};
	}

	updatePopoverSize() {
		const rect = this.contentNode.current.getBoundingClientRect();
		if (
			! this.state.popoverSize ||
			rect.width !== this.state.popoverSize.width ||
			rect.height !== this.state.popoverSize.height
		) {
			const popoverSize = {
				height: rect.height,
				width: rect.width,
			};
			this.setState( { popoverSize } );
			return popoverSize;
		}
		return this.state.popoverSize;
	}

	computePopoverPosition( popoverSize ) {
		const { getAnchorRect = this.getAnchorRect, position = 'top', expandOnMobile } = this.props;
		const newPopoverPosition = computePopoverPosition(
			getAnchorRect(), popoverSize || this.state.popoverSize, position, expandOnMobile
		);

		if (
			this.state.yAxis !== newPopoverPosition.yAxis ||
			this.state.xAxis !== newPopoverPosition.xAxis ||
			this.state.popoverLeft !== newPopoverPosition.popoverLeft ||
			this.state.popoverTop !== newPopoverPosition.popoverTop ||
			this.state.contentHeight !== newPopoverPosition.contentHeight ||
			this.state.contentWidth !== newPopoverPosition.contentWidth ||
			this.state.isMobile !== newPopoverPosition.isMobile
		) {
			this.setState( newPopoverPosition );
		}
	}

	maybeClose( event ) {
		const { onKeyDown, onClose } = this.props;

		// Close on escape
		if ( event.keyCode === ESCAPE && onClose ) {
			event.stopPropagation();
			onClose();
		}

		// Preserve original content prop behavior
		if ( onKeyDown ) {
			onKeyDown( event );
		}
	}

	render() {
		const {
			headerTitle,
			onClose,
			children,
			className,
			onClickOutside = onClose,
			noArrow,
			// Disable reason: We generate the `...contentProps` rest as remainder
			// of props which aren't explicitly handled by this component.
			/* eslint-disable no-unused-vars */
			position,
			range,
			focusOnMount,
			getAnchorRect,
			expandOnMobile,
			/* eslint-enable no-unused-vars */
			...contentProps
		} = this.props;
		const {
			popoverLeft,
			popoverTop,
			yAxis,
			xAxis,
			contentHeight,
			contentWidth,
			popoverSize,
			isMobile,
		} = this.state;

		const classes = classnames(
			'components-popover',
			className,
			'is-' + yAxis,
			'is-' + xAxis,
			{
				'is-mobile': isMobile,
				'no-arrow': noArrow || ( xAxis === 'center' && yAxis === 'middle' ),
			}
		);

		// Disable reason: We care to capture the _bubbled_ events from inputs
		// within popover as inferring close intent.

		/* eslint-disable jsx-a11y/no-static-element-interactions */
		let content = (
			<PopoverDetectOutside onClickOutside={ onClickOutside }>
				<div
					className={ classes }
					style={ {
						top: ! isMobile && popoverTop ? popoverTop + 'px' : undefined,
						left: ! isMobile && popoverLeft ? popoverLeft + 'px' : undefined,
						visibility: popoverSize ? undefined : 'hidden',
					} }
					{ ...contentProps }
					onKeyDown={ this.maybeClose }
				>
					{ isMobile && (
						<div className="components-popover__header">
							<span className="components-popover__header-title">
								{ headerTitle }
							</span>
							<IconButton className="components-popover__close" icon="no-alt" onClick={ onClose } />
						</div>
					) }
					<div
						ref={ this.contentNode }
						className="components-popover__content"
						style={ {
							maxHeight: ! isMobile && contentHeight ? contentHeight + 'px' : undefined,
							maxWidth: ! isMobile && contentWidth ? contentWidth + 'px' : undefined,
						} }
						tabIndex="-1"
					>
						{ children }
					</div>
				</div>
			</PopoverDetectOutside>
		);
		/* eslint-enable jsx-a11y/no-static-element-interactions */

		// Apply focus to element as long as focusOnMount is truthy; false is
		// the only "disabled" value.
		if ( focusOnMount ) {
			content = <FocusManaged>{ content }</FocusManaged>;
		}

		// In case there is no slot context in which to render, default to an
		// in-place rendering.
		const { getSlot } = this.context;
		if ( getSlot && getSlot( SLOT_NAME ) ) {
			content = <Fill name={ SLOT_NAME }>{ content }</Fill>;
		}

		return <span ref={ this.anchorNode }>
			{ content }
			{ isMobile && expandOnMobile && <ScrollLock /> }
		</span>;
	}
}

Popover.defaultProps = {
	focusOnMount: 'firstElement',
	noArrow: false,
};

const PopoverContainer = Popover;

PopoverContainer.contextTypes = {
	getSlot: noop,
};

PopoverContainer.Slot = () => <Slot bubblesVirtually name={ SLOT_NAME } />;

export default PopoverContainer;
