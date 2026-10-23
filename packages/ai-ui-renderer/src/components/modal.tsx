import { createComponentImplementation } from '@a2ui/react';
import { ComponentIdSchema } from '@a2ui/web_core/v1_0';
import { Modal as GutenbergModal } from '@wordpress/components';
import { useCallback, useContext, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import clsx from 'clsx';
import { z } from 'zod';
import { InteractiveUiSurfaceContext, ModalTriggerContext } from '../contexts/surface';
import { copyTheme } from '../utils/theme';

export const Modal = createComponentImplementation(
	{
		name: 'Modal',
		schema: z.object( { trigger: ComponentIdSchema, content: ComponentIdSchema } ),
	},
	( { props, buildChild } ) => {
		const [ isOpen, setIsOpen ] = useState( false );
		const { disabled: isDisabled, className, rootRef } = useContext( InteractiveUiSurfaceContext );

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
						title={ __( 'Details', 'default' ) }
						overlayClassName={ clsx( 'ai-ui-renderer__modal', className ) }
						onRequestClose={ () => setIsOpen( false ) }
					>
						<fieldset className="ai-ui-renderer" disabled={ isDisabled }>
							{ buildChild( props.content ) }
						</fieldset>
					</GutenbergModal>
				) }
			</>
		);
	}
);
