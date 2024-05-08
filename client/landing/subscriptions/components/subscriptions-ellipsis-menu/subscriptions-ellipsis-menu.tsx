import { Gridicon, Popover } from '@automattic/components';
import { Button } from '@wordpress/components';
import clsx from 'clsx';
import { useRef } from 'react';
import usePopoverToggle from 'calypso/landing/subscriptions/hooks/use-popover-toggle';
import './styles.scss';

type SubscriptionsEllipsisMenuProps = {
	children?: ( ( onClose: () => void ) => React.ReactNode ) | React.ReactNode;
	popoverClassName?: string;
	toggleTitle?: string;
	verticalToggle?: boolean;
};

const SubscriptionsEllipsisMenu = ( {
	children,
	popoverClassName,
	toggleTitle,
	verticalToggle,
}: SubscriptionsEllipsisMenuProps ) => {
	const { showPopover, onToggle, onClose } = usePopoverToggle();
	const buttonRef = useRef< HTMLButtonElement >( null );

	return (
		<div className="subscriptions-ellipsis-menu">
			<Button
				className={ clsx( 'subscriptions-ellipsis-menu__toggle', {
					'is-popover-visible': showPopover,
					'has-vertical-toggle': verticalToggle,
				} ) }
				onClick={ onToggle }
				ref={ buttonRef }
				title={ toggleTitle }
				icon={ <Gridicon icon="ellipsis" size={ 24 } /> }
			/>

			<Popover
				position="bottom left"
				hideArrow
				onClose={ onClose }
				isVisible={ showPopover }
				context={ buttonRef.current }
				className={ clsx( 'subscriptions-ellipsis-menu__popover', popoverClassName ) }
			>
				{ typeof children === 'function' ? children( onClose ) : children }
			</Popover>
		</div>
	);
};

export default SubscriptionsEllipsisMenu;
