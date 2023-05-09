import { CardFooter } from '@wordpress/components';
import classnames from 'classnames';
import { Route, Routes } from 'react-router-dom';
import { HelpCenterContactButton } from './help-center-contact-page';

const HelpCenterFooter: React.FC = () => {
	const className = classnames( 'help-center__container-footer' );

	return (
		<CardFooter className={ className }>
			<Routes>
				<Route path="/" element={ <HelpCenterContactButton /> } />
			</Routes>
		</CardFooter>
	);
};

export default HelpCenterFooter;
