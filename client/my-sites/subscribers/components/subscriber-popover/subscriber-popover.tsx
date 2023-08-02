import { Gridicon } from '@automattic/components';
import { close, Icon, seen, trash } from '@wordpress/icons';
import classNames from 'classnames';
import { translate } from 'i18n-calypso';
import { useCallback, useRef, useState } from 'react';
import PopoverMenu from 'calypso/components/popover-menu';
import PopoverMenuItem from 'calypso/components/popover-menu/item';

import '../shared/popover-style.scss';

type SubscriberPopoverProps = {
	isCancelPaidSubscriptionButtonVisible?: boolean;
	isViewButtonVisible?: boolean;
	onCancelPaidSubscription?: () => void;
	onUnsubscribe: () => void;
	onView?: () => void;
};

const SubscriberPopover = ( {
	isCancelPaidSubscriptionButtonVisible = false,
	isViewButtonVisible = false,
	onCancelPaidSubscription,
	onUnsubscribe,
	onView,
}: SubscriberPopoverProps ) => {
	const [ isVisible, setIsVisible ] = useState( false );
	const onToggle = useCallback( () => setIsVisible( ( visible ) => ! visible ), [] );
	const buttonRef = useRef< HTMLButtonElement >( null );

	return (
		<div className="subscriber-popover__container">
			<button
				aria-label="Open subscriber menu"
				className={ classNames( 'components-button subscriber-popover__toggle', {
					'is-popover-visible': isVisible,
				} ) }
				onClick={ onToggle }
				ref={ buttonRef }
			>
				<Gridicon icon="ellipsis" size={ 24 } />
			</button>

			<PopoverMenu
				position="bottom left"
				onClose={ () => setIsVisible( false ) }
				isVisible={ isVisible }
				context={ buttonRef.current }
				className="subscriber-popover"
				focusOnShow={ false }
			>
				{ isViewButtonVisible && (
					<PopoverMenuItem onClick={ onView }>
						<Icon icon={ seen } size={ 18 } className="gridicon" viewBox="2 2 20 20" />
						{ translate( 'View' ) }
					</PopoverMenuItem>
				) }
				{ isCancelPaidSubscriptionButtonVisible && (
					<PopoverMenuItem onClick={ onCancelPaidSubscription }>
						<Icon icon={ close } size={ 18 } className="gridicon" viewBox="2 2 20 20" />
						{ translate( 'Cancel paid subscription' ) }
					</PopoverMenuItem>
				) }
				<PopoverMenuItem onClick={ onUnsubscribe }>
					<Icon icon={ trash } size={ 18 } className="gridicon" viewBox="2 2 20 20" />
					{ translate( 'Remove' ) }
				</PopoverMenuItem>
			</PopoverMenu>
		</div>
	);
};

export default SubscriberPopover;
