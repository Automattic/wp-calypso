import { Button, Gridicon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';

import './style.scss';

const noop = () => undefined;

type BackButtonProps = {
	label?: string;
	onClick?: () => void;
	icon?: string;
};

const BackButton = ( { label, onClick = noop, icon = 'arrow-left' }: BackButtonProps ) => {
	const translate = useTranslate();
	return (
		<div className="back-button">
			<Button borderless compact onClick={ onClick }>
				<Gridicon icon={ icon } />
				<span className="back-button__label">{ label ?? translate( 'Back' ) }</span>
			</Button>
		</div>
	);
};

export default BackButton;
