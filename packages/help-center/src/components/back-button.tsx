import { Button } from '@wordpress/components';
import { Icon, chevronLeft } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import clsx from 'clsx';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles.scss';

export type Props = { onClick?: () => void; backToRoot?: boolean; className?: string };

export const BackButton = ( { onClick, backToRoot = false, className }: Props ) => {
	const { __ } = useI18n();
	const location = useLocation();
	const navigate = useNavigate();
	const buttonClassName = clsx( 'back-button__help-center', className );
	const queryParams = new URLSearchParams( location.search );
	const backUrl = queryParams.get( 'backUrl' );

	function handleOnClick() {
		const currentPath = location.pathname;
		if ( currentPath === '/odie' ) {
			navigate( '/' );
			return;
		}

		if ( backUrl ) {
			navigate( backUrl );
			return;
		}
		if ( onClick ) {
			onClick();
			return;
		}
		if ( backToRoot || location.key === 'default' ) {
			// Workaround to detect when we don't have prior history
			// https://github.com/remix-run/react-router/discussions/9922#discussioncomment-4722480
			navigate( '/' );
		} else {
			navigate( -1 );
		}
	}

	return (
		<Button
			className={ buttonClassName }
			/* eslint-disable-next-line jsx-a11y/no-autofocus */
			autoFocus
			onClick={ handleOnClick }
		>
			<Icon icon={ chevronLeft } size={ 18 } />
			{ __( 'Back', __i18n_text_domain__ ) }
		</Button>
	);
};
