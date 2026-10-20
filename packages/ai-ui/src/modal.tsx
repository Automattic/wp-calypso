import { createComponentImplementation } from '@a2ui/react/v0_9';
import { ModalApi } from '@a2ui/web_core/v0_9';
import { Modal as GutenbergModal } from '@wordpress/components';
import { useContext, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { InteractiveUiDisabledContext, ModalTriggerContext } from './context';

export const Modal = createComponentImplementation(
	{ name: ModalApi.name, schema: ModalApi.schema.pick( { trigger: true, content: true } ) },
	( { props, buildChild } ) => {
		const [ isOpen, setIsOpen ] = useState( false );
		const isDisabled = useContext( InteractiveUiDisabledContext );
		return (
			<>
				<ModalTriggerContext.Provider value={ () => setIsOpen( true ) }>
					{ buildChild( props.trigger ) }
				</ModalTriggerContext.Provider>
				{ isOpen && (
					<GutenbergModal
						title={ __( 'Details', 'default' ) }
						overlayClassName="automattic-interactive-ui-modal"
						onRequestClose={ () => setIsOpen( false ) }
					>
						<fieldset
							data-agenttic-isolated
							className="automattic-interactive-ui"
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
