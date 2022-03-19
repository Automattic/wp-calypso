import { Button, Gridicon } from '@automattic/components';
import classnames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { ReactChild } from 'react';
import './style.scss';

interface Props {
	direction: 'back' | 'forward';
	handleClick: () => void;
	label?: string | ReactChild;
	backIcon?: string;
	forwardIcon?: string;
	primary?: boolean;
	borderless?: boolean;
	cssClass?: string;
}

const StepNavigationLink: React.FC< Props > = ( {
	direction,
	handleClick,
	label,
	primary,
	borderless = true,
	cssClass,
} ) => {
	const translate = useTranslate();

	let text = label;
	if ( direction === 'back' ) {
		text = translate( 'Back' );
	} else if ( direction === 'forward' ) {
		text = translate( 'Skip for now' );
	}

	const buttonClasses = classnames( 'navigation-link', cssClass );

	return (
		<Button
			primary={ primary }
			borderless={ borderless }
			className={ buttonClasses }
			onClick={ handleClick }
		>
			{ direction === 'back' && <Gridicon icon={ 'chevron-left' } size={ 18 } /> }
			{ text }
			{ direction === 'forward' && <Gridicon icon={ 'chevron-right' } size={ 18 } /> }
		</Button>
	);
};

export default StepNavigationLink;
