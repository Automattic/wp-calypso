import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { MouseEvent } from 'react';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import { useSelector } from 'calypso/state';
import { getCurrentUserEmail } from 'calypso/state/current-user/selectors';

import './style.scss';

const PasswordResetTipField = ( {
	tipClickHandler,
}: {
	tipClickHandler: ( event: MouseEvent< HTMLElement > ) => void;
} ) => {
	const translate = useTranslate();
	const userEmail = useSelector( getCurrentUserEmail );

	return (
		<FormSettingExplanation>
			{ translate(
				'Your password reset email is {{strong}}%(userEmail)s{{/strong}}. {{a}}Change it{{/a}}.',
				{
					args: {
						userEmail,
					},
					components: {
						strong: <strong />,
						a: (
							<Button
								href="#"
								className="password-reset-tip-field__change-it-button"
								onClick={ tipClickHandler }
								plain
							/>
						),
					},
				}
			) }
		</FormSettingExplanation>
	);
};

export default PasswordResetTipField;
