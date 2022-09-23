import { Button } from '@automattic/components';
import { Icon, chevronLeft } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import { useHistory } from 'react-router-dom';
import type { FC } from 'react';
import '../styles.scss';

export type Props = { onClick?: () => void; backToRoot?: boolean };

export const BackButton: FC< Props > = ( { onClick, backToRoot = false } ) => {
	const { __ } = useI18n();
	const history = useHistory();
	function defaultOnClick() {
		if ( backToRoot ) {
			history.push( '/' );
		} else {
			history.goBack();
		}
	}
	return (
		<Button
			className="back-button__help-center"
			borderless={ true }
			onClick={ onClick || defaultOnClick }
		>
			<Icon icon={ chevronLeft } size={ 18 } />
			{ __( 'Back', __i18n_text_domain__ ) }
		</Button>
	);
};
