import { Button, Guide } from '@wordpress/components';
import { take } from 'lodash-es/array';
import { useState } from 'react';
import './modal-style.scss';
import Visual from './plans-visual.svg';

export default function ModalTemplate( {
	featureClass,
	CTA,
	trackImpression,
	message,
	description,
	onClick,
	onDismiss,
	title,
	disclaimer,
} ) {
	trackImpression && trackImpression();

	// technically, non-dismissable jitms are authorable, however, that doesn't make any sense as a modal.
	const [ isDismissed, setDismissed ] = useState( [] );

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
								{ take( disclaimer, 2 ).map( ( line ) => (
									<p className="modal__disclaimer">{ line }</p>
								) ) }
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
