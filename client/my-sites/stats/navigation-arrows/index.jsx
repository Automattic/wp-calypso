import { Icon, arrowLeft, arrowRight } from '@wordpress/icons';
import classNames from 'classnames';

import './style.scss';

function NavigationArrows( {
	disableNextArrow,
	disablePreviousArrow,
	onArrowNext,
	onArrowPrevious,
} ) {
	const handleClickNext = () => {
		onArrowNext();
	};
	const handleClickPrevious = () => {
		onArrowPrevious();
	};
	return (
		<div className="stats-navigation-arrows">
			<button
				className={ classNames( 'stats-navigation-arrows__previous', {
					'is-disabled': disablePreviousArrow,
				} ) }
				onClick={ disablePreviousArrow ? undefined : () => handleClickPrevious() }
				tabIndex={ ! disablePreviousArrow ? 0 : -1 }
			>
				<Icon className="gridicon" icon={ arrowLeft } />
			</button>
			<button
				className={ classNames( 'stats-navigation-arrows__next', {
					'is-disabled': disableNextArrow,
				} ) }
				onClick={ disableNextArrow ? undefined : () => handleClickNext() }
				tabIndex={ ! disableNextArrow ? 0 : -1 }
			>
				<Icon className="gridicon" icon={ arrowRight } />
			</button>
		</div>
	);
}

export default NavigationArrows;
