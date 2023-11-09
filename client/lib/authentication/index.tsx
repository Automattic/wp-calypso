import { useTranslate } from 'i18n-calypso';
import './style.scss';

export const FormDivider = () => {
	const translate = useTranslate();

	return (
		<div className="auth-form__separator">
			<div className="auth-form__separator-text">{ translate( 'or' ) }</div>
		</div>
	);
};
