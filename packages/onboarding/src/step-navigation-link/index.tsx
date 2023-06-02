import { Button, Gridicon } from '@automattic/components';
import classnames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { ReactChild } from 'react';
import './style.scss';

interface Props {
	direction: 'back' | 'forward';
	handleClick?: () => void;
	label?: string | ReactChild;
	hasBackIcon?: boolean;
	hasForwardIcon?: boolean;
	primary?: boolean;
	borderless?: boolean;
	cssClass?: string;
	rel?: string;
	recordClick?: () => void;
}

const StepNavigationLink: React.FC< Props > = ( {
	direction,
	handleClick,
	label,
	hasBackIcon,
	hasForwardIcon,
	primary,
	borderless = true,
	cssClass,
	rel,
	recordClick,
} ) => {
	const translate = useTranslate();

	let backGridicon;
	let text;
	let forwardGridicon;

	if ( direction === 'back' ) {
		backGridicon = hasBackIcon ? <Gridicon icon="chevron-left" size={ 18 } /> : null;
		if ( label ) {
			text = label;
		} else {
			text = translate( 'Back' );
		}
	} else if ( direction === 'forward' ) {
		forwardGridicon = hasForwardIcon ? <Gridicon icon="chevron-right" size={ 18 } /> : null;
		text = label ? label : translate( 'Skip for now' );
	}

	const buttonClasses = classnames( 'navigation-link', cssClass );

	const onClick = () => {
		recordClick?.();
		handleClick?.();
	};

	return (
		<Button
			primary={ primary }
			borderless={ borderless }
			className={ buttonClasses }
			onClick={ onClick }
			rel={ rel }
		>
			{ backGridicon }
			{ text }
			{ forwardGridicon }
		</Button>
	);
};

export default StepNavigationLink;
