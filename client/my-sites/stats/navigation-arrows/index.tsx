import { Icon, arrowLeft, arrowRight } from '@wordpress/icons';
import clsx from 'clsx';

import './style.scss';

interface NavigationArrowsProps {
	className?: string;
	disableNextArrow: boolean;
	disablePreviousArrow: boolean;
	onClickNext: () => void;
	onClickPrevious: () => void;
}

function NavigationArrows( {
	className,
	disableNextArrow,
	disablePreviousArrow,
	onClickNext,
	onClickPrevious,
}: NavigationArrowsProps ) {
	return (
		<div className={ clsx( 'stats-navigation-arrows', className ) }>
			<button
				className={ clsx( 'stats-navigation-arrows__previous', {
					'is-disabled': disablePreviousArrow,
				} ) }
				onClick={ disablePreviousArrow ? undefined : onClickPrevious }
				tabIndex={ ! disablePreviousArrow ? 0 : -1 }
			>
				<Icon className="gridicon" icon={ arrowLeft } />
			</button>
			<button
				className={ clsx( 'stats-navigation-arrows__next', {
					'is-disabled': disableNextArrow,
				} ) }
				onClick={ disableNextArrow ? undefined : onClickNext }
				tabIndex={ ! disableNextArrow ? 0 : -1 }
			>
				<Icon className="gridicon" icon={ arrowRight } />
			</button>
		</div>
	);
}

export default NavigationArrows;
