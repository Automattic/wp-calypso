import { Gridicon } from '@automattic/components';
import { Icon, seen, trash } from '@wordpress/icons';
import classNames from 'classnames';
import { translate } from 'i18n-calypso';
import { useCallback, useRef, useState } from 'react';
import PopoverMenu from 'calypso/components/popover-menu';
import PopoverMenuItem from 'calypso/components/popover-menu/item';

import './styles.scss';

type SubscriptionPopoverProps = {
	onUnsubscribe: () => void;
	onView: () => void;
};

const SubscriberPopover = ( { onUnsubscribe, onView }: SubscriptionPopoverProps ) => {
	const [ isVisible, setIsVisible ] = useState( false );
	const onToggle = useCallback( () => setIsVisible( ( visible ) => ! visible ), [] );
	const buttonRef = useRef< HTMLButtonElement >( null );

	return (
		<div className="subscriber-list__popover-container">
			<button
				className={ classNames( 'subscriber-list__popover-toggle', {
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
				<PopoverMenuItem onClick={ onView }>
					<Icon icon={ seen } size={ 18 } className="gridicon" viewBox="2 2 20 20" />
					{ translate( 'View' ) }
				</PopoverMenuItem>
				<PopoverMenuItem onClick={ onUnsubscribe }>
					<Icon icon={ trash } size={ 18 } className="gridicon" viewBox="2 2 20 20" />
					{ translate( 'Unsubscribe' ) }
				</PopoverMenuItem>
			</PopoverMenu>
		</div>
	);
};

export { SubscriberPopover };
