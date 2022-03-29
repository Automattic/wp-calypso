import { CardBody } from '@wordpress/components';
import classnames from 'classnames';

const HelpCenterDesktopContent: React.FC = () => {
	const className = classnames( 'help-center__container-content' );

	return (
		<CardBody className={ className }>
			<div>content</div>
		</CardBody>
	);
};

export default HelpCenterDesktopContent;
