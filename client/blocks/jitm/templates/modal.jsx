import { Button, Guide } from '@wordpress/components';
import { useState } from 'react';
import './modal-style.scss';
import Inbox from './inbox.svg';
import Visual from './plans-visual.svg';

export default function ModalTemplate( {
	CTA,
	description,
	disclaimer,
	featureClass,
	icon,
	message,
	onClick,
	onDismiss,
	title,
	trackImpression,
} ) {
	trackImpression && trackImpression();

	// technically, non-dismissable jitms are authorable, however, that doesn't make any sense as a modal.
	const [ isDismissed, setDismissed ] = useState( [] );

	const getModalImage = () => {
		switch ( icon ) {
			case 'mailbox':
				return Inbox;
			default:
				return Visual;
		}
	};

	const getModalAltText = () => {
		switch ( icon ) {
			case 'mailbox':
				return 'Embedded inbox';
			default:
				return 'list of available plans — premium, business, and ecommerce plans';
		}
	};

	const modalImage = (
		<img className={ icon || 'plans' } src={ getModalImage() } alt={ getModalAltText() } />
	);

	return isDismissed.includes( featureClass ) ? null : (
		<Guide
			className="modal__main"
			contentLabel={ message }
			onFinish={ () => {
				onDismiss();
				setDismissed( isDismissed.concat( [ featureClass ] ) );
			} }
			pages={ [
				{
					content: (
						<>
							<div className="modal__container">
								{ /* todo: allow specifying this text via jitm configuration */ }
								<p className="modal__limited-offer">{ title }</p>
								<h1 className="modal__heading">{ message }</h1>
								<p className="modal__text">
									{ description }
									<br />
									<Button
										href={ CTA.link }
										isPrimary={ true }
										onClick={ () => {
											onClick();
											setDismissed( isDismissed.concat( [ featureClass ] ) );
										} }
									>
										{ CTA.message }
									</Button>
								</p>
								{ disclaimer.slice( 0, 2 ).map( ( line ) => (
									<p className="modal__disclaimer">{ line }</p>
								) ) }
							</div>
							<div className="modal__sidebar">{ modalImage }</div>
						</>
					),
				},
			] }
		/>
	);
}
