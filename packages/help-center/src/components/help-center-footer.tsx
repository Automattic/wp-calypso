import { CardFooter } from '@wordpress/components';
import classnames from 'classnames';
import { Route } from 'react-router-dom';
import { HelpCenterContactButton } from './help-center-contact-page';

const HelpCenterFooter: React.FC = () => {
	const className = classnames( 'help-center__container-footer' );

	return (
		<CardFooter className={ className }>
			<Route path="/" exact>
				<HelpCenterContactButton />
			</Route>
		</CardFooter>
	);
};

export default HelpCenterFooter;
