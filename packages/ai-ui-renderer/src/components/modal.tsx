import { createComponentImplementation } from '@a2ui/react';
import { ComponentIdSchema } from '@a2ui/web_core/v1_0';
import { useCallback, useRef, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Icon, close } from '@wordpress/icons';
import { Dialog } from '@wordpress/ui';
import clsx from 'clsx';
import { z } from 'zod';
import { ModalTriggerContext, useInteractiveUiSurface } from '../contexts/surface';
import { StringValueSchema } from '../utils/schemas';
import { copyTheme } from '../utils/theme';

export const Modal = createComponentImplementation(
	{
		name: 'Modal',
		schema: z.object( {
			trigger: ComponentIdSchema,
			content: ComponentIdSchema,
			accessibility: z.object( { label: StringValueSchema.optional() } ).optional(),
		} ),
	},
	( { props, buildChild } ) => {
		const [ isOpen, setIsOpen ] = useState( false );
		const triggerRef = useRef< HTMLElement | null >( null );
		const popupRef = useRef< HTMLDivElement | null >( null );
		const { className, rootRef } = useInteractiveUiSurface();

		// The modal renders outside the host, so it takes the theme its surface resolved.
		const copySurfaceTheme = useCallback(
			( overlay: HTMLDivElement | null ) => {
				if ( overlay && rootRef?.current ) {
					copyTheme( rootRef.current, overlay );
				}
			},
			[ rootRef ]
		);

		return (
			<Dialog.Root open={ isOpen } onOpenChange={ setIsOpen }>
				<ModalTriggerContext.Provider
					value={ ( trigger ) => {
						triggerRef.current = trigger ?? null;
						setIsOpen( true );
					} }
				>
					{ buildChild( props.trigger ) }
				</ModalTriggerContext.Provider>
				<Dialog.Popup
					ref={ popupRef }
					className="ai-ui-renderer__dialog"
					size="medium"
					initialFocus={ popupRef }
					finalFocus={ triggerRef }
					portal={
						<Dialog.Portal
							ref={ copySurfaceTheme }
							className={ clsx( 'ai-ui-renderer__modal', className ) }
						/>
					}
				>
					<Dialog.Header>
						<Dialog.Title>
							{ props.accessibility?.label || __( 'Details', 'default' ) }
						</Dialog.Title>
						{ /* CloseIcon's tooltip needs private APIs that older WordPress hosts lack. */ }
						<Dialog.Action
							className="ai-ui-renderer__dialog-close"
							variant="minimal"
							tone="neutral"
							size="compact"
							aria-label={ __( 'Close', 'default' ) }
						>
							<Icon icon={ close } />
						</Dialog.Action>
					</Dialog.Header>
					<Dialog.Content>
						<div className="ai-ui-renderer">{ buildChild( props.content ) }</div>
					</Dialog.Content>
				</Dialog.Popup>
			</Dialog.Root>
		);
	}
);
