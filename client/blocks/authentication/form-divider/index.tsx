import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import './style.scss';

const FormDivider = ( { isHorizontal }: { isHorizontal: boolean } ) => {
	const translate = useTranslate();

	return (
		<div className={ clsx( 'auth-form__separator', { 'is-horizontal': isHorizontal } ) }>
			<div className="auth-form__separator-text">{ translate( 'or' ) }</div>
		</div>
	);
};

export default FormDivider;
