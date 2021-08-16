import { Button } from '@automattic/components';
import { Guide } from '@wordpress/components';
import React, { useState } from 'react';
import './modal-style.scss';
import Visual from './plans-visual.svg';

export default function ModalTemplate( {
	CTA,
	trackImpression,
	message,
	description,
	onClick,
	onDismiss,
	messageExpiration,
} ) {
	trackImpression && trackImpression();

	// technically, non-dismissable jitms are authorable, however, that doesn't make any sense as a modal.
	const [ isDismissed, setDismissed ] = useState( false );

	return isDismissed ? null : (
		<Guide
			className="modal__main"
			contentLabel={ message }
			onFinish={ () => {
				onDismiss();
				setDismissed( true );
			} }
			pages={ [
				{
					content: (
						<>
							<div className="modal__container">
								{ /* todo: allow specifying this text via jitm configuration */ }
								<p className="modal__limited-offer">LIMITED TIME ONLY</p>
								<h1 className="modal__heading">{ message }</h1>
								<p className="modal__text">
									{ description }
									<br />
									<Button
										primary={ true }
										onClick={ () => {
											onClick();
											// todo: is this the best way in calypso???
											location.href = CTA.link;
										} }
									>
										{ CTA.message }
									</Button>
								</p>
								{ messageExpiration ? (
									<p className="modal__disclaimer">
										Offer valid to { messageExpiration.format( 'LLL' ) }
									</p>
								) : null }
								<p className="modal__disclaimer">
									{ /* todo: allow specifying disclaimer text via jitm configuration */ }
									Promotion only valid for the initial subscription purchased during this sale.
								</p>
							</div>
							<div className="modal__sidebar">
								<img
									src={ Visual }
									alt="list of available plans — premium, business, and ecommerce plans"
								/>
							</div>
						</>
					),
				},
			] }
		/>
	);
}
