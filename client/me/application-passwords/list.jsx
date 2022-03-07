import { useTranslate } from 'i18n-calypso';
import FormSectionHeading from 'calypso/components/forms/form-section-heading';
import AppPasswordItem from 'calypso/me/application-password-item';

export default function AppPasswordsList( { appPasswords = [] } ) {
	const translate = useTranslate();

	if ( ! appPasswords.length ) {
		return null;
	}

	return (
		<div className="application-passwords__active">
			<FormSectionHeading>{ translate( 'Active Passwords' ) }</FormSectionHeading>
			<ul className="application-passwords__list">
				{ appPasswords.map( ( password ) => (
					<AppPasswordItem password={ password } key={ password.ID } />
				) ) }
			</ul>
		</div>
	);
}
