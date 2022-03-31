import { CardBody } from '@wordpress/components';
import classnames from 'classnames';
import { Content } from './types';

const HelpCenterContent: React.FC< Content > = ( { content } ) => {
	const className = classnames( 'help-center__container-content' );

	return (
		<CardBody className={ className }>
			<div>{ content }</div>
		</CardBody>
	);
};

export default HelpCenterContent;
