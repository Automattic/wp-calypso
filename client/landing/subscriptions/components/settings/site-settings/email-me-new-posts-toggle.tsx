import { ToggleControl } from '@wordpress/components';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';

type EmailMeNewPostsToggleProps = {
	className?: string;
	isDisabled?: boolean;
	hintText?: boolean;
	value: boolean;
	onChange: ( value: boolean ) => void;
};

const EmailMeNewPostsToggle = ( {
	className = '',
	isDisabled = false,
	hintText = false,
	value = false,
	onChange,
}: EmailMeNewPostsToggleProps ) => {
	const translate = useTranslate();

	return (
		<div className={ clsx( 'email-me-new-posts-toggle', className, { 'is-enabled': value } ) }>
			<ToggleControl
				label={ translate( 'Email me new posts' ) }
				onChange={ () => onChange( ! value ) }
				checked={ value }
				disabled={ isDisabled }
			/>
			{ hintText && <div className="email-new-posts-toggle__hint">{ hintText }</div> }
		</div>
	);
};

export default EmailMeNewPostsToggle;
