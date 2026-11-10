import { createComponentImplementation } from '@a2ui/react';
import { ComponentIdSchema } from '@a2ui/web_core/v1_0';
import { useCallback, useMemo, useRef, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Icon, close } from '@wordpress/icons';
import { Dialog } from '@wordpress/ui';
import clsx from 'clsx';
import { z } from 'zod';
import {
	InteractiveUiSurfaceContext,
	ModalTriggerContext,
	useInteractiveUiSurface,
} from '../contexts/surface';
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
		const contentRef = useRef< HTMLDivElement | null >( null );
		const surface = useInteractiveUiSurface();
		const { className, rootRef } = surface;
		const contentSurface = useMemo( () => ( { ...surface, rootRef: contentRef } ), [ surface ] );

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
						// On `<body>`, not ui's overlay layer, which stacks above the chart tooltips
						// that portal there.
						<Dialog.Portal
							container={ document.body }
							ref={ copySurfaceTheme }
							className={ clsx( 'ai-ui-renderer__modal', className ) }
						/>
					}
				>
					<Dialog.Header>
						<Dialog.Title>
							{ props.accessibility?.label || __( 'Details', 'default' ) }
						</Dialog.Title>
						{ /* CloseIconButton's tooltip needs private APIs that older WordPress hosts lack. */ }
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
						<InteractiveUiSurfaceContext.Provider value={ contentSurface }>
							<div ref={ contentRef } className="ai-ui-renderer">
								{ buildChild( props.content ) }
							</div>
						</InteractiveUiSurfaceContext.Provider>
					</Dialog.Content>
				</Dialog.Popup>
			</Dialog.Root>
		);
	}
);
