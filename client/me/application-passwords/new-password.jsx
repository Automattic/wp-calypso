import { Card } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import FormButton from 'calypso/components/forms/form-button';
import FormButtonsBar from 'calypso/components/forms/form-buttons-bar';

export default function NewAppPassword( { appName, newAppPassword, onClickDone } ) {
	const translate = useTranslate();

	return (
		<Card className="application-passwords__new-password">
			<p className="application-passwords__new-password-display">{ newAppPassword }</p>

			<p className="application-passwords__new-password-help">
				{ translate(
					'Use this password to log in to {{strong}}%(appName)s{{/strong}}. Note: spaces are ignored.',
					{
						args: { appName },
						components: { strong: <strong /> },
					}
				) }
			</p>

			<FormButtonsBar>
				<FormButton onClick={ onClickDone }>{ translate( 'Done' ) }</FormButton>
			</FormButtonsBar>
		</Card>
	);
}
