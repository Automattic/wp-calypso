import { CardBody } from '@wordpress/components';
import classnames from 'classnames';
import { ReactElement } from 'react';

interface Props {
	content: ReactElement;
}

const HelpCenterDesktopContent: React.FC< Props > = ( { content } ) => {
	const className = classnames( 'help-center__container-content' );

	return (
		<CardBody className={ className }>
			<div>{ content }</div>
		</CardBody>
	);
};

export default HelpCenterDesktopContent;
