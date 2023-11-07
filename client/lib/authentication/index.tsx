import { useI18n } from '@wordpress/react-i18n';
import './style.scss';

export const FormDivider = () => {
	const { __ } = useI18n();

	return (
		<div className="auth-form__separator">
			<div className="auth-form__separator-text">{ __( 'or' ) }</div>
		</div>
	);
};
