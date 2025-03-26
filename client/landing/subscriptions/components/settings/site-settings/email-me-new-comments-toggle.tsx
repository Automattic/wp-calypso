import { ToggleControl } from '@wordpress/components';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';

type EmailMeNewCommentsToggleProps = {
	className?: string;
	value: boolean;
	isDisabled: boolean;
	onChange: ( value: boolean ) => void;
};

const EmailMeNewCommentsToggle = ( {
	className = '',
	value = false,
	isDisabled = false,
	onChange,
}: EmailMeNewCommentsToggleProps ) => {
	const translate = useTranslate();

	return (
		<div className={ clsx( 'email-me-new-comments-toggle', className ) }>
			<ToggleControl
				label={ translate( 'Email me new comments' ) }
				onChange={ () => onChange( ! value ) }
				checked={ value }
				disabled={ isDisabled }
			/>
		</div>
	);
};

export default EmailMeNewCommentsToggle;
