import { Button } from '@wordpress/components';
import { Icon, chevronLeft } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import { useNavigate, useLocation } from 'react-router-dom';
import type { FC } from 'react';
import '../styles.scss';

export type Props = { onClick?: () => void; backToRoot?: boolean };

export const BackButton: FC< Props > = ( { onClick, backToRoot = false } ) => {
	const { __ } = useI18n();
	const location = useLocation();
	const navigate = useNavigate();
	function defaultOnClick() {
		if ( backToRoot ) {
			navigate( '/' );
		} else if ( location.key === 'default' ) {
			// Workaround to detect when we don't have prior history
			// https://github.com/remix-run/react-router/discussions/9922#discussioncomment-4722480
			navigate( '/' );
		} else {
			navigate( -1 );
		}
	}
	return (
		<Button className="back-button__help-center" onClick={ onClick || defaultOnClick }>
			<Icon icon={ chevronLeft } size={ 18 } />
			{ __( 'Back', __i18n_text_domain__ ) }
		</Button>
	);
};
