import { Button, Dialog } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';

import './style.scss';

type Props = {
	show: boolean;
	onClose: () => void;
};

export default function UserFeedbackForm( { show, onClose }: Props ) {
	const translate = useTranslate();
	return (
		<Dialog
			isVisible={ show }
			additionalOverlayClassNames="user-feedback-form-modal"
			onClose={ onClose }
		>
			<div className="user-feedback-form-modal__main">
				<h1 className="user-feedback-form-modal__title">
					{ translate( 'Help us make Jetpack Manage even better' ) }
				</h1>

				<p className="user-feedback-form-modal__instruction">
					{ translate(
						'Your product feedback is extremely valuable to us. Our goal is to help you do your work better and more efficiently - all feedback is sent to our product team and helps inform our development roadmap.'
					) }
				</p>
			</div>

			<div className="user-feedback-form-modal__footer">
				<Button className="user-feedback-form-modal__footer-submit" primary>
					{ translate( 'Submit your feedback' ) }
				</Button>
			</div>
		</Dialog>
	);
}
