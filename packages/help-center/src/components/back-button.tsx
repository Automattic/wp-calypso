import { Button, Gridicon } from '@automattic/components';
import { useI18n } from '@wordpress/react-i18n';
import type { FC } from 'react';
import '../styles.scss';

type Props = { onClick: () => void };

export const BackButton: FC< Props > = ( { onClick } ) => {
	const { __ } = useI18n();

	return (
		<Button className="back-button__help-center" borderless={ true } onClick={ onClick }>
			<Gridicon icon={ 'chevron-left' } size={ 18 } />
			{ __( 'Back', __i18n_text_domain__ ) }
		</Button>
	);
};
