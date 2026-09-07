import { Button, Modal } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { close } from '@wordpress/icons';
import clsx from 'clsx';
import { useState } from 'react';
import type { ReactNode } from 'react';

export type GuideModalStep = {
	title?: string;
	description?: string;
	preview?: ReactNode;
};

// Ported 1:1 from a8c-for-agencies' GuideModal so the referral onboarding
// matches production exactly (client/a8c-for-agencies/components/guide-modal).
export default function GuideModal( {
	onClose,
	steps,
	dismissable = true,
}: {
	onClose: () => void;
	steps: GuideModalStep[];
	dismissable?: boolean;
} ) {
	const [ step, setStep ] = useState( 0 );

	if ( ! steps || ! steps.length ) {
		return null;
	}

	const isLastStep = step === steps.length - 1;
	const isFirstStep = step === 0;

	const nextStep = () => {
		if ( isLastStep ) {
			onClose();
			return;
		}
		setStep( ( prev ) => prev + 1 );
	};

	const prevStep = () => {
		if ( ! isFirstStep ) {
			setStep( ( prev ) => prev - 1 );
		}
	};

	return (
		<Modal onRequestClose={ onClose } className="guide-modal__wrapper" __experimentalHideHeader>
			<div className="guide-modal__content">
				{ dismissable && (
					<Button
						className="guide-modal__dismiss-button"
						onClick={ onClose }
						label={ __( 'Close' ) }
						icon={ close }
					/>
				) }

				<div className="guide-modal__header">{ steps[ step ].preview }</div>
				<div className="guide-modal__main">
					<div className="guide-modal__body">
						<div className="guide-modal__pagination-dots">
							{ steps.map( ( _, index ) => (
								<span
									key={ index }
									className={ clsx( 'guide-modal__pagination-dot', {
										active: step === index,
									} ) }
								/>
							) ) }
						</div>
						<h3>{ steps[ step ].title }</h3>
						<p>{ steps[ step ].description }</p>
					</div>
					<div className="guide-modal__footer">
						{ ! isFirstStep && (
							<Button variant="tertiary" onClick={ prevStep } className="guide-modal__back-button">
								{ __( 'Back' ) }
							</Button>
						) }
						<Button variant="primary" onClick={ nextStep } className="guide-modal__next-button">
							{ isLastStep ? __( 'Done' ) : __( 'Next' ) }
						</Button>
					</div>
				</div>
			</div>
		</Modal>
	);
}
