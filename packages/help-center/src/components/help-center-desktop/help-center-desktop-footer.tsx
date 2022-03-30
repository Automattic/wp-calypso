import { CardFooter } from '@wordpress/components';
import classnames from 'classnames';

const HelpCenterDesktopFooter: React.FC = () => {
	const className = classnames( 'help-center__container-footer' );

	return (
		<CardFooter className={ className }>
			<div>footer</div>
		</CardFooter>
	);
};

export default HelpCenterDesktopFooter;
