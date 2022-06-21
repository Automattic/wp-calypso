/* eslint-disable wpcalypso/jsx-classname-namespace */
import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';

type DIFMLinkProps = {
	onClick: () => void;
};

export const DIFMLink = ( { onClick }: DIFMLinkProps ) => {
	const translate = useTranslate();

	return (
		<div className="goals-link__container">
			<p className="goals-link__description">
				{ translate( 'Hire our experts to create your dream site' ) }
			</p>
			<Button className="goals-link__button" onClick={ onClick }>
				{ translate( 'Get Started' ) }
			</Button>
		</div>
	);
};

export default DIFMLink;
