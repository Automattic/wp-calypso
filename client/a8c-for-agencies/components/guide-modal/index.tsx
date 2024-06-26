import { Button } from '@automattic/components';
import { Modal } from '@wordpress/components';
import { Icon, close } from '@wordpress/icons';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';

import './style.scss';

type GuideModalStep = {
	title?: string;
	description?: string;
	preview?: React.ReactNode;
};

export type GuideModalProps = {
	steps?: GuideModalStep[];
	onClose: () => void;
	dismissable?: boolean;
};

const GuideModal = ( { onClose, steps, dismissable }: GuideModalProps ) => {
	const [ step, setStep ] = useState( 0 );
	const translate = useTranslate();

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
		if ( isFirstStep ) {
			return;
		}
		setStep( ( prev ) => prev - 1 );
	};

	return (
		<Modal onRequestClose={ onClose } className="guide-modal__wrapper" __experimentalHideHeader>
			<div className="guide-modal__content">
				{ dismissable && (
					<Button
						className="guide-modal__dismiss-button"
						onClick={ onClose }
						plain
						aria-label={ translate( 'close' ) }
					>
						<Icon className="gridicon" icon={ close } />
					</Button>
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
								></span>
							) ) }
						</div>
						<h3>{ steps[ step ].title }</h3>
						<p>{ steps[ step ].description }</p>
					</div>
					<div className="guide-modal__footer">
						{ ! isFirstStep && (
							<Button borderless onClick={ prevStep } className="guide-modal__back-button">
								{ translate( 'Back' ) }
							</Button>
						) }
						<Button primary onClick={ nextStep } className="guide-modal__next-button">
							{ isLastStep ? translate( 'Done' ) : translate( 'Next' ) }
						</Button>
					</div>
				</div>
			</div>
		</Modal>
	);
};
export default GuideModal;
