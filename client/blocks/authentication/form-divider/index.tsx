import { useTranslate } from 'i18n-calypso';
import './style.scss';

const FormDivider = () => {
	const translate = useTranslate();

	return (
		<div className="auth-form__separator">
			<div className="auth-form__separator-text">{ translate( 'or' ) }</div>
		</div>
	);
};

export default FormDivider;
