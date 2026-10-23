import { __experimentalHeading as Heading } from '@wordpress/components';
import { Icon, cloud, gift, payment } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import { PlaygroundConfirmModal } from '../playground-confirm-modal';

import './style.scss';

interface PlaygroundSaveModalProps {
	onConfirm: () => void;
	onCancel: () => void;
	isConfirming?: boolean;
}

export function PlaygroundSaveModal( {
	onConfirm,
	onCancel,
	isConfirming,
}: PlaygroundSaveModalProps ) {
	const { __ } = useI18n();

	const benefits = [
		{
			icon: cloud,
			title: __( 'Your store, everywhere' ),
			description: __( 'Access it anytime from your account' ),
		},
		{
			icon: gift,
			title: __( 'Time to explore' ),
			description: __( '14-day free trial. No credit card needed' ),
		},
		{
			icon: payment,
			title: __( 'Only pay when you’re ready' ),
			description: __( 'Launch on your own timeline' ),
		},
	];

	return (
		<PlaygroundConfirmModal
			className="playground-save-modal"
			title={ __( 'Save my store' ) }
			description={ __(
				'Your store will be saved to WordPress.com. Access it anytime from your account to continue building or go live.'
			) }
			confirmLabel={ __( 'Continue to WordPress.com' ) }
			cancelLabel={ __( 'Keep building' ) }
			onConfirm={ onConfirm }
			onCancel={ onCancel }
			isConfirming={ isConfirming }
		>
			<Heading level={ 2 } size={ 18 } weight={ 600 } lineHeight={ 1.5 }>
				{ __( 'When you save, you unlock:' ) }
			</Heading>
			<ul className="playground-save-modal__benefits">
				{ benefits.map( ( { icon, title, description } ) => (
					<li key={ title } className="playground-save-modal__benefit">
						<Icon className="playground-save-modal__benefit-icon" icon={ icon } size={ 32 } />
						<div>
							<p className="playground-save-modal__benefit-title">{ title }</p>
							<p className="playground-save-modal__benefit-description">{ description }</p>
						</div>
					</li>
				) ) }
			</ul>
		</PlaygroundConfirmModal>
	);
}
