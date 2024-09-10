import { WordPressLogo } from '@automattic/components';
import { Button } from '@wordpress/components';
import { useI18n } from '@wordpress/react-i18n';
import clsx from 'clsx';
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
			<WordPressLogo
				className={ clsx( 'social-icons', {
					'social-icons--enabled': ! isDisabled,
					'social-icons--disabled': !! isDisabled,
				} ) }
				size={ 20 }
			/>
			<span className="social-buttons__service-name">{ __( 'Continue with email' ) }</span>
		</Button>
	);
};

export default UsernameOrEmailButton;
