import { CardFooter } from '@wordpress/components';
import classnames from 'classnames';

const HelpCenterFooter: React.FC = () => {
	const className = classnames( 'help-center__container-footer' );

	return (
		<CardFooter className={ className }>
			<div>footer</div>
		</CardFooter>
	);
};

export default HelpCenterFooter;
