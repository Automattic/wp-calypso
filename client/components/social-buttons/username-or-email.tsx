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
	 * Shows the WordPress.com logo on the email button. Signup opts out so email reads as a
	 * peer of Google and Apple rather than the house pick.
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
				// 20 to match the other icons' box; the glyph is scaled up in CSS instead.
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
