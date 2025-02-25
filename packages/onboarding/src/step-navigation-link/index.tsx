import { Gridicon } from '@automattic/components';
import { Button } from '@wordpress/components';
import clsx from 'clsx';
import { TranslateResult, useTranslate } from 'i18n-calypso';
import './style.scss';

interface Props {
	direction: 'back' | 'forward';
	handleClick?: () => void;
	label?: TranslateResult;
	hasBackIcon?: boolean;
	hasForwardIcon?: boolean;
	primary?: boolean;
	cssClass?: string;
	rel?: string;
	backUrl?: string;
	recordClick?: () => void;
}

const StepNavigationLink: React.FC< Props > = ( {
	direction,
	handleClick,
	label,
	hasBackIcon,
	hasForwardIcon,
	primary,
	cssClass,
	rel,
	recordClick,
	backUrl,
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

	const buttonClasses = clsx( 'navigation-link', cssClass );

	const onClick = () => {
		recordClick?.();
		handleClick?.();
	};

	const getVariant = () => {
		if ( primary ) {
			return 'primary';
		}

		if ( backUrl ) {
			return 'link';
		}

		return 'tertiary';
	};

	return (
		<Button
			className={ buttonClasses }
			onClick={ onClick }
			href={ backUrl }
			rel={ rel }
			variant={ getVariant() }
		>
			{ backGridicon }
			{ text }
			{ forwardGridicon }
		</Button>
	);
};

export default StepNavigationLink;
