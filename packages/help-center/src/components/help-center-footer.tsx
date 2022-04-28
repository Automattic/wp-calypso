import { CardFooter } from '@wordpress/components';
import classnames from 'classnames';
import { ReactElement } from 'react';

interface Props {
	footerContent: ReactElement;
}

const HelpCenterFooter: React.FC< Props > = ( { footerContent } ) => {
	const className = classnames( 'help-center__container-footer' );

	return <CardFooter className={ className }>{ footerContent }</CardFooter>;
};

export default HelpCenterFooter;
