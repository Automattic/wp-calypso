import { Button, Dialog, FormLabel } from '@automattic/components';
import { Icon, close } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { ChangeEvent, useCallback, useState } from 'react';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormTextarea from 'calypso/components/forms/form-textarea';
import Rating from 'calypso/components/rating';

import './style.scss';

type Props = {
	show: boolean;
	onClose: () => void;
};

export default function UserFeedbackForm( { show, onClose }: Props ) {
	const translate = useTranslate();

	const [ feedback, setFeedback ] = useState( '' );

	const onFeedBackChange = useCallback( ( event: ChangeEvent< HTMLInputElement > ) => {
		setFeedback( event.currentTarget.value );
	}, [] );

	return (
		<Dialog
			isVisible={ show }
			additionalOverlayClassNames="user-feedback-form-modal"
			onClose={ onClose }
		>
			<Button
				className="user-feedback-form-modal__close-button"
				plain
				onClick={ onClose }
				aria-label={ translate( 'Close' ) }
			>
				<Icon size={ 24 } icon={ close } />
			</Button>

			<div className="user-feedback-form-modal__main">
				<h1 className="user-feedback-form-modal__title">
					{ translate( 'Help us make Jetpack Manage even better' ) }
				</h1>

				<p className="user-feedback-form-modal__instruction">
					{ translate(
						'Your product feedback is extremely valuable to us. Our goal is to help you do your work better and more efficiently - all feedback is sent to our product team and helps inform our development roadmap.'
					) }
				</p>

				<FormFieldset>
					<FormLabel htmlFor="textarea">
						{ translate( 'What can we do to make Jetpack Manage better for you?' ) }
					</FormLabel>
					<FormTextarea
						name="textarea"
						id="textarea"
						placeholder="Add your feedback here"
						value={ feedback }
						onChange={ onFeedBackChange }
					/>
				</FormFieldset>

				<FormFieldset>
					<FormLabel htmlFor="textarea">
						{ translate( 'How satisfied with Jetpack Manage are you?' ) }
					</FormLabel>
					{ /* TODO: Implement a clickable Rating component */ }
					<Rating rating={ 65 } size={ 32 } />
				</FormFieldset>
			</div>

			<div className="user-feedback-form-modal__footer">
				<Button className="user-feedback-form-modal__footer-submit" primary disabled={ ! feedback }>
					{ translate( 'Submit your feedback' ) }
				</Button>
			</div>
		</Dialog>
	);
}
