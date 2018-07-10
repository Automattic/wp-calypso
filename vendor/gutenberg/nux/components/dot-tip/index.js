/**
 * WordPress dependencies
 */
import { compose } from '@wordpress/element';
import { Popover, Button, IconButton, withSafeTimeout } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { withSelect, withDispatch } from '@wordpress/data';

/**
 * Internal dependencies
 */
import './style.scss';

export function DotTip( {
	children,
	isVisible,
	hasNextTip,
	onDismiss,
	onDisable,
} ) {
	if ( ! isVisible ) {
		return null;
	}

	return (
		<Popover
			className="nux-dot-tip"
			position="middle right"
			noArrow
			focusOnMount="container"
			role="dialog"
			aria-label={ __( 'Gutenberg tips' ) }
			onClick={ ( event ) => event.stopPropagation() }
		>
			<p>{ children }</p>
			<p>
				<Button isLink onClick={ onDismiss }>
					{ hasNextTip ? __( 'See next tip' ) : __( 'Got it' ) }
				</Button>
			</p>
			<IconButton
				className="nux-dot-tip__disable"
				icon="no-alt"
				label={ __( 'Disable tips' ) }
				onClick={ onDisable }
			/>
		</Popover>
	);
}

export default compose(
	withSafeTimeout,
	withSelect( ( select, { id } ) => {
		const { isTipVisible, getAssociatedGuide } = select( 'core/nux' );
		const associatedGuide = getAssociatedGuide( id );
		return {
			isVisible: isTipVisible( id ),
			hasNextTip: !! ( associatedGuide && associatedGuide.nextTipId ),
		};
	} ),
	withDispatch( ( dispatch, { id } ) => {
		const { dismissTip, disableTips } = dispatch( 'core/nux' );
		return {
			onDismiss() {
				dismissTip( id );
			},
			onDisable() {
				disableTips();
			},
		};
	} ),
)( DotTip );
