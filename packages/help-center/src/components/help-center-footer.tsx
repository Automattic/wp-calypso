import { CardFooter } from '@wordpress/components';
import { Route, Routes } from 'react-router-dom';
import { HelpCenterContactButton } from './help-center-contact-page';

import './help-center-footer.scss';

const HelpCenterFooter: React.FC = () => {
	return (
		<CardFooter className="help-center__container-footer">
			<Routes>
				<Route path="/" element={ <HelpCenterContactButton /> } />
				<Route path="*" element={ null } />
			</Routes>
		</CardFooter>
	);
};

export default HelpCenterFooter;
