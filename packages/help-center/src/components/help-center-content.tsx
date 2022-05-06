import { CardBody } from '@wordpress/components';
import classnames from 'classnames';
import { Content } from './types';

const HelpCenterContent: React.FC< Content > = ( { content, isMinimized } ) => {
	const className = classnames( 'help-center__container-content' );

	return (
		<CardBody hidden={ isMinimized } className={ className }>
			<div>{ content }</div>
		</CardBody>
	);
};

export default HelpCenterContent;
