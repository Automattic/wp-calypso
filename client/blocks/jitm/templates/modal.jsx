import { Button } from '@automattic/components';
import { Guide } from '@wordpress/components';
import React from 'react';
import './modal-style.scss';
import Visual from './plans-visual.svg';

export default function ModalTemplate( { CTA, message, description, onClick, onDismiss } ) {
	return (
		<Guide
			className="modal__main"
			contentLabel={ message }
			onFinish={ onDismiss }
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
									<Button primary={ true } onClick={ onClick }>
										{ CTA.message }
									</Button>
								</p>
								<p className="modal__disclaimer">
									{ /* todo: allow specifying disclaimer text via jitm configuration */ }
									Offer valid to [whenever] [figure out time in local zone]
								</p>
								<p className="modal__disclaimer">
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
