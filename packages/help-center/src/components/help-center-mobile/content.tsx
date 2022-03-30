import { CardBody } from '@wordpress/components';
import classnames from 'classnames';
import { Content } from '../types';

const HelpCenterMobileContent: React.FC< Content > = ( { content } ) => {
	const className = classnames( 'help-center-mobile__content' );

	return (
		<CardBody className={ className }>
			<div>{ content }</div>
		</CardBody>
	);
};

export default HelpCenterMobileContent;
