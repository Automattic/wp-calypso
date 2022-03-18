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
	backIcon,
	forwardIcon,
	primary,
	borderless = true,
	cssClass,
} ) => {
	const translate = useTranslate();

	let backGridicon;
	let text;
	let forwardGridicon;

	if ( direction === 'back' ) {
		backGridicon = backIcon ? <Gridicon icon={ backIcon } size={ 18 } /> : null;
		if ( label ) {
			text = label;
		} else {
			text = translate( 'Back' );
		}
	} else if ( direction === 'forward' ) {
		forwardGridicon = forwardIcon ? <Gridicon icon={ forwardIcon } size={ 18 } /> : null;
		text = label ? label : translate( 'Skip for now' );
	}

	const buttonClasses = classnames( 'navigation-link', cssClass );

	return (
		<Button
			primary={ primary }
			borderless={ borderless }
			className={ buttonClasses }
			onClick={ handleClick }
		>
			{ backGridicon }
			{ text }
			{ forwardGridicon }
		</Button>
	);
};

export default StepNavigationLink;
