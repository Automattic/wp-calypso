import { Button, Modal } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import './style.scss';

export const StartNewDesignWarningModal = ( {
	setOpenModal,
	onContinue,
	adminUrl,
	classname = 'woocommerce-customize-store__design-change-warning-modal',
}: {
	setOpenModal: ( arg0: boolean ) => void;
	adminUrl: string;
	onContinue: () => void;
	classname?: string;
} ) => {
	return (
		<Modal
			className={ classname }
			title={ __( 'Are you sure you want to start a new design?', 'woocommerce' ) }
			onRequestClose={ () => setOpenModal( false ) }
			shouldCloseOnClickOutside={ false }
		>
			<p>
				{ createInterpolateElement(
					__(
						"The Store Designer will create a new store design for you, and you'll lose any changes you've made to your active theme. If you'd prefer to continue editing your theme, you can do so via the <EditorLink>Editor</EditorLink>.",
						'woocommerce'
					),
					{
						EditorLink: (
							<Button
								variant="link"
								onClick={ () => {
									window.open( `${ adminUrl }site-editor.php`, '_blank' );
									return false;
								} }
								href=""
							/>
						),
					}
				) }
			</p>
			<div className="woocommerce-customize-store__design-change-warning-modal-footer">
				<Button onClick={ () => setOpenModal( false ) } variant="link">
					{ __( 'Cancel', 'woocommerce' ) }
				</Button>
				<Button onClick={ onContinue } variant="primary">
					{ __( 'Design with AI', 'woocommerce' ) }
				</Button>
			</div>
		</Modal>
	);
};

export const StartOverWarningModal = ( {
	setOpenModal,
	onContinue,
	adminUrl,
	classname = 'woocommerce-customize-store__design-change-warning-modal',
}: {
	setOpenModal: ( arg0: boolean ) => void;
	onContinue: () => void;
	adminUrl: string;
	classname?: string;
} ) => {
	return (
		<Modal
			className={ classname }
			title={ __( 'Are you sure you want to start over?', 'woocommerce' ) }
			onRequestClose={ () => setOpenModal( false ) }
			shouldCloseOnClickOutside={ false }
		>
			<p>
				{ createInterpolateElement(
					__(
						"You'll be asked to provide your business info again, and will lose your existing AI design. If you want to customize your existing design, you can do so via the <EditorLink>Editor</EditorLink>.",
						'woocommerce'
					),
					{
						EditorLink: (
							<Button
								variant="link"
								onClick={ () => {
									window.open( `${ adminUrl }site-editor.php`, '_blank' );
									return false;
								} }
								href=""
							/>
						),
					}
				) }
			</p>
			<div className="woocommerce-customize-store__design-change-warning-modal-footer">
				<Button onClick={ () => setOpenModal( false ) } variant="link">
					{ __( 'Cancel', 'woocommerce' ) }
				</Button>
				<Button onClick={ onContinue } variant="primary">
					{ __( 'Start again', 'woocommerce' ) }
				</Button>
			</div>
		</Modal>
	);
};
