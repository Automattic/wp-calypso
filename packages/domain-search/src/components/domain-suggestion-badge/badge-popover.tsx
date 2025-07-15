import { Button, Popover } from '@wordpress/components';
import { info } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import { useRef, useState } from 'react';
import type { ReactNode } from 'react';

export const BadgePopover = ( { children }: { children: ReactNode } ) => {
	const { __ } = useI18n();
	const buttonRef = useRef< HTMLButtonElement >( null );
	const [ isPopoverOpen, setIsPopoverOpen ] = useState( false );

	const toggleVisible = ( event: React.MouseEvent ) => {
		if ( buttonRef.current && ! buttonRef.current.contains( event.target as Node ) ) {
			return;
		}

		setIsPopoverOpen( ( prev ) => ! prev );
	};
	return (
		<>
			<Button
				aria-label={ __( 'Learn more' ) }
				variant="tertiary"
				size="small"
				style={ { color: 'inherit' } }
				icon={ info }
				ref={ buttonRef }
				onClick={ toggleVisible }
			/>
			{ isPopoverOpen && (
				<Popover
					focusOnMount
					anchor={ buttonRef.current }
					position="bottom right"
					onClose={ () => setIsPopoverOpen( false ) }
				>
					<div className="domain-suggestion-badge__popover-content">{ children }</div>
				</Popover>
			) }
		</>
	);
};
