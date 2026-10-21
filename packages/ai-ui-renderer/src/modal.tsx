import { createComponentImplementation } from '@a2ui/react/v0_9';
import { ModalApi } from '@a2ui/web_core/v0_9';
import { Modal as GutenbergModal } from '@wordpress/components';
import { useContext, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import clsx from 'clsx';
import { InteractiveUiSurfaceContext, ModalTriggerContext } from './context';

export const Modal = createComponentImplementation(
	{ name: ModalApi.name, schema: ModalApi.schema.pick( { trigger: true, content: true } ) },
	( { props, buildChild } ) => {
		const [ isOpen, setIsOpen ] = useState( false );
		const { disabled: isDisabled, themeClassName } = useContext( InteractiveUiSurfaceContext );
		return (
			<>
				<ModalTriggerContext.Provider value={ () => setIsOpen( true ) }>
					{ buildChild( props.trigger ) }
				</ModalTriggerContext.Provider>
				{ isOpen && (
					<GutenbergModal
						title={ __( 'Details', 'default' ) }
						overlayClassName="ai-ui-renderer__modal"
						onRequestClose={ () => setIsOpen( false ) }
					>
						<fieldset
							className={ clsx( 'ai-ui-renderer', themeClassName ) }
							disabled={ isDisabled }
						>
							{ buildChild( props.content ) }
						</fieldset>
					</GutenbergModal>
				) }
			</>
		);
	}
);
