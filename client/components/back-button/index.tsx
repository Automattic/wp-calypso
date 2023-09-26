import { Button, Gridicon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';

import './style.scss';

type BackButtonProps = {
	onClick?: () => void;
};

const BackButton = ( props: BackButtonProps ) => {
	const translate = useTranslate();
	return (
		<div className="back-button">
			<Button borderless compact { ...props }>
				<Gridicon icon="arrow-left" />
				<span className="back-button__label">{ translate( 'Back' ) }</span>
			</Button>
		</div>
	);
};

export default BackButton;
