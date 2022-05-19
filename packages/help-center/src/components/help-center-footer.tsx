import { CardFooter } from '@wordpress/components';
import classnames from 'classnames';
import type { ReactNode } from 'react';

interface Props {
	footerContent: ReactNode;
}

const HelpCenterFooter: React.FC< Props > = ( { footerContent } ) => {
	const className = classnames( 'help-center__container-footer' );

	return <CardFooter className={ className }>{ footerContent }</CardFooter>;
};

export default HelpCenterFooter;
