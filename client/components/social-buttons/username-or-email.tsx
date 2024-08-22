import { Button } from '@wordpress/components';
import { useI18n } from '@wordpress/react-i18n';
import clsx from 'clsx';
import MailIcon from 'calypso/components/social-icons/mail';
import { useSelector } from 'calypso/state';
import { isFormDisabled } from 'calypso/state/login/selectors';

type UsernameOrEmailButtonProps = {
	onClick: () => void;
};

const UsernameOrEmailButton = ( { onClick }: UsernameOrEmailButtonProps ) => {
	const { __ } = useI18n();
	const isDisabled = useSelector( isFormDisabled );

	return (
		<Button
			className={ clsx( 'social-buttons__button button', { disabled: isDisabled } ) }
			onClick={ onClick }
			disabled={ isDisabled }
		>
			<MailIcon width="20" height="20" isDisabled={ isDisabled } />
			<span className="social-buttons__service-name">{ __( 'Continue with Email' ) }</span>
		</Button>
	);
};

export default UsernameOrEmailButton;
