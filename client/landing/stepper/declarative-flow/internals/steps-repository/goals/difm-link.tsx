import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import './difm-link.scss';

type DIFMLinkProps = {
	onClick: () => void;
};

export const DIFMLink = ( { onClick }: DIFMLinkProps ) => {
	const translate = useTranslate();

	return (
		<div className="difm-link__container">
			<p className="difm-link__description">
				{ translate( 'Hire our experts to create your dream site' ) }
			</p>
			<Button className="difm-link__button" onClick={ onClick }>
				{ translate( 'Get Started' ) }
			</Button>
		</div>
	);
};

export default DIFMLink;
