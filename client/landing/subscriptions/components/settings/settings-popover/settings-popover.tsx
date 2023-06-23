import { Gridicon, Popover } from '@automattic/components';
import classNames from 'classnames';
import { useRef } from 'react';
import usePopoverToggle from 'calypso/landing/subscriptions/hooks/use-popover-toggle';
import './styles.scss';

type SettingsPopoverProps = {
	children?: ( ( onClose: () => void ) => React.ReactNode ) | React.ReactNode;
	className?: string;
};

const SettingsPopover = ( { children, className }: SettingsPopoverProps ) => {
	const { showPopover, onToggle, onClose } = usePopoverToggle();
	const buttonRef = useRef< HTMLButtonElement >( null );

	return (
		<div className="settings-popover__container">
			<button
				className={ classNames( 'settings-popover__toggle', {
					'is-popover-visible': showPopover,
				} ) }
				onClick={ onToggle }
				ref={ buttonRef }
			>
				<Gridicon icon="ellipsis" size={ 24 } />
			</button>

			<Popover
				position="bottom left"
				hideArrow
				onClose={ onClose }
				isVisible={ showPopover }
				context={ buttonRef.current }
				className={ classNames( 'settings-popover', className ) }
			>
				{ typeof children === 'function' ? children( onClose ) : children }
			</Popover>
		</div>
	);
};

export default SettingsPopover;
