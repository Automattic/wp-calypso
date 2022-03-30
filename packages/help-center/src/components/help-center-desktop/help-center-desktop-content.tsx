import { CardBody } from '@wordpress/components';
import classnames from 'classnames';
import { Content } from '../types';

const HelpCenterDesktopContent: React.FC< Content > = ( { content } ) => {
	const className = classnames( 'help-center__container-content' );

	return (
		<CardBody className={ className }>
			<div>{ content }</div>
		</CardBody>
	);
};

export default HelpCenterDesktopContent;
