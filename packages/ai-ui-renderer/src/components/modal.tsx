import { createComponentImplementation } from '@a2ui/react';
import { ComponentIdSchema } from '@a2ui/web_core/v1_0';
import { Modal as GutenbergModal } from '@wordpress/components';
import { useCallback, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
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
			<>
				<ModalTriggerContext.Provider value={ () => setIsOpen( true ) }>
					{ buildChild( props.trigger ) }
				</ModalTriggerContext.Provider>
				{ isOpen && (
					<GutenbergModal
						ref={ copySurfaceTheme }
						size="medium"
						title={ props.accessibility?.label || __( 'Details', 'default' ) }
						overlayClassName={ clsx( 'ai-ui-renderer__modal', className ) }
						onRequestClose={ () => setIsOpen( false ) }
					>
						<div className="ai-ui-renderer">{ buildChild( props.content ) }</div>
					</GutenbergModal>
				) }
			</>
		);
	}
);
