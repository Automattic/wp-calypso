import { Gridicon } from '@automattic/components';
import { close, Icon, seen, trash, box } from '@wordpress/icons';
import clsx from 'clsx';
import { translate } from 'i18n-calypso';
import { useCallback, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import PopoverMenu from 'calypso/components/popover-menu';
import PopoverMenuItem from 'calypso/components/popover-menu/item';
import '../shared/popover-style.scss';
import { getCouponsAndGiftsEnabledForSiteId } from 'calypso/state/memberships/settings/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';

type SubscriberPopoverProps = {
	isCancelPaidSubscriptionButtonVisible?: boolean;
	isViewButtonVisible?: boolean;
	onCancelPaidSubscription?: () => void;
	onUnsubscribe: () => void;
	onView?: () => void;
	onGiftSubscription?: () => void;
};

const SubscriberPopover = ( {
	isCancelPaidSubscriptionButtonVisible = false,
	isViewButtonVisible = false,
	onCancelPaidSubscription,
	onUnsubscribe,
	onGiftSubscription,
	onView,
}: SubscriberPopoverProps ) => {
	const [ isVisible, setIsVisible ] = useState( false );
	const onToggle = useCallback( () => setIsVisible( ( visible ) => ! visible ), [] );
	const buttonRef = useRef< HTMLButtonElement >( null );
	const site = useSelector( getSelectedSite );
	const couponsAndGiftsEnabled = useSelector( ( state ) =>
		getCouponsAndGiftsEnabledForSiteId( state, site?.ID )
	);
	return (
		<div className="subscriber-popover__container">
			<button
				aria-label="Open subscriber menu"
				className={ clsx( 'components-button subscriber-popover__toggle', {
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
				{ couponsAndGiftsEnabled && onGiftSubscription && (
					<PopoverMenuItem onClick={ onGiftSubscription }>
						<Icon icon={ box } size={ 18 } className="gridicon" viewBox="2 2 20 20" />
						{ translate( 'Gift a subscription' ) }
					</PopoverMenuItem>
				) }
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
