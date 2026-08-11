import { WordPressLogo } from '@automattic/components';
import { Button } from '@wordpress/components';
import { Icon, envelope } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import clsx from 'clsx';
import { useSelector } from 'calypso/state';
import { isFormDisabled } from 'calypso/state/login/selectors';

import '@automattic/components/styles/wp-button-override.scss';
import './style.scss';

type UsernameOrEmailButtonProps = {
	onClick: () => void;
	/**
	 * Marks email out as the WordPress.com option, which is what the login page wants: its
	 * other buttons are all third parties. Signup opts out, because there the logo reads as
	 * branding on one button of three rather than as a provider, so email looks like the
	 * house pick instead of a peer of Google and Apple.
	 */
	showWordPressLogo?: boolean;
};

export const UsernameOrEmailButton = ( {
	onClick,
	showWordPressLogo = true,
}: UsernameOrEmailButtonProps ) => {
	const { __ } = useI18n();
	const isDisabled = useSelector( isFormDisabled );

	return (
		<Button
			className="a8c-components-wp-button social-buttons__button"
			onClick={ onClick }
			disabled={ isDisabled }
			variant="secondary"
			__next40pxDefaultSize
		>
			{ showWordPressLogo ? (
				<WordPressLogo
					className={ clsx(
						'social-icons',
						isDisabled ? 'social-icons--disabled' : 'social-icons--enabled'
					) }
					size={ 20 }
				/>
			) : (
				<Icon
					icon={ envelope }
					size={ 20 }
					className={ clsx( 'social-icons', 'social-icons__envelope', {
						'social-icons--disabled': isDisabled,
						'social-icons--enabled': ! isDisabled,
					} ) }
				/>
			) }
			<span className="social-buttons__service-name">{ __( 'Continue with email' ) }</span>
		</Button>
	);
};

export default UsernameOrEmailButton;
