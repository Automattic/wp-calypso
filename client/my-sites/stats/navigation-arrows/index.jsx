import { Icon, arrowLeft, arrowRight } from '@wordpress/icons';
import classNames from 'classnames';

function NavigationArrows( {
	disableNextArrow,
	disablePreviousArrow,
	onArrowNext,
	onArrowPrevious,
} ) {
	const handleClickNext = () => {
		// eslint-disable-next-line no-console
		console.log( 'click next' );
		onArrowNext();
	};
	const handleClickPrevious = () => {
		// eslint-disable-next-line no-console
		console.log( 'click previous' );
		onArrowPrevious();
	};
	return (
		<div className={ classNames( 'stats-period-navigation', 'stats-year-navigation' ) }>
			<button
				className={ classNames( 'stats-period-navigation__previous', {
					'is-disabled': disablePreviousArrow,
				} ) }
				onClick={ disablePreviousArrow ? undefined : () => handleClickPrevious() }
				tabIndex={ ! disablePreviousArrow ? 0 : -1 }
			>
				<Icon className="gridicon" icon={ arrowLeft } />
			</button>
			<button
				className={ classNames( 'stats-period-navigation__next', {
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
