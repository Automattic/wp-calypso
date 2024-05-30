import { Button } from '@automattic/components';
import { Modal } from '@wordpress/components';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import privateSiteGraphic from 'calypso/assets/images/a8c-for-agencies/referral-step-background.png';

import './style.scss';

type GuideModalStep = {
	title?: string;
	description?: string;
};

export type GuideModalProps = {
	steps?: GuideModalStep[];
	onClose: () => void;
};

const GuideModal = ( { onClose, steps }: GuideModalProps ) => {
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
				<div className="guide-modal__header">
					<img src={ privateSiteGraphic } alt="Refer Products" className="guide-modal__image" />
				</div>
				<div className="guide-modal__main">
					<div className="guide-modal__body">
						<div className="guide-modal__pagination-dots">
							{ steps.map( ( _, index ) => (
								<span
									key={ index }
									className={ classNames( 'guide-modal__pagination-dot', {
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
