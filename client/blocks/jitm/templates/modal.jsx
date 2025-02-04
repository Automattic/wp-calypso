import { Button, Guide } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import './modal-style.scss';
import Inbox from './embedded-inbox.svg';
import Visual from './plans-visual.svg';

export default function ModalTemplate( {
	CTA,
	description,
	disclaimer,
	featureClass,
	icon,
	iconPath,
	message,
	onClick,
	onDismiss,
	title,
	trackImpression,
} ) {
	// technically, non-dismissable jitms are authorable, however, that doesn't make any sense as a modal.
	const [ isDismissed, setDismissed ] = useState( [] );
	const translate = useTranslate();

	const getModalImage = () => {
		// If a direct path is provided, use the referenced image as the JITM artwork.
		if ( iconPath ) {
			return iconPath;
		}

		switch ( icon ) {
			case 'embedded-inbox':
				return Inbox;
			default:
				return Visual;
		}
	};

	const getModalAltText = () => {
		switch ( icon ) {
			case 'embedded-inbox':
				return translate( 'Embedded inbox', { textOnly: true } );
			default:
				return translate( 'List of available WordPress.com plans', {
					textOnly: true,
				} );
		}
	};

	const getModalImageClassName = () => {
		switch ( icon ) {
			case 'embedded-inbox':
				return 'modal__embedded-inbox';
			default:
				return 'modal__plans';
		}
	};

	const getModalClassName = () => {
		return `modal__main modal--${ featureClass }`;
	};

	return isDismissed.includes( featureClass ) ? null : (
		<Guide
			className={ getModalClassName() }
			contentLabel={ message }
			onFinish={ () => {
				onDismiss();
				setDismissed( isDismissed.concat( [ featureClass ] ) );
			} }
			pages={ [
				{
					content: (
						<>
							{ trackImpression && trackImpression() }
							<div className="modal__container">
								{ /* todo: allow specifying this text via jitm configuration */ }
								<p className="modal__limited-offer">{ title }</p>
								<h1 className="modal__heading">{ message }</h1>
								<p className="modal__text">
									{ description }
									<Button
										href={ CTA.link }
										isPrimary
										onClick={ () => {
											onClick();
											setDismissed( isDismissed.concat( [ featureClass ] ) );
										} }
										tabIndex={ -2 }
									>
										{ CTA.message }
									</Button>
								</p>
								{ disclaimer.slice( 0, 2 ).map( ( line ) => (
									<p className="modal__disclaimer">{ line }</p>
								) ) }
							</div>
							<div className="modal__sidebar">
								<img
									className={ getModalImageClassName() }
									src={ getModalImage() }
									alt={ getModalAltText() }
								/>
							</div>
						</>
					),
				},
			] }
		/>
	);
}
