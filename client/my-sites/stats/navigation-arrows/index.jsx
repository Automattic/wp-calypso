import { Icon, arrowLeft, arrowRight } from '@wordpress/icons';
import classNames from 'classnames';

function NavigationArrows( { disableNextArrow, disablePreviousArrow, handleClickArrow } ) {
	const handleClickNext = () => {
		// eslint-disable-next-line no-console
		console.log( 'click next' );
		handleClickArrow( true );
	};
	const handleClickPrevious = () => {
		// eslint-disable-next-line no-console
		console.log( 'click previous' );
		handleClickArrow();
	};
	return (
		<div className={ classNames( 'stats-period-navigation', 'stats-year-navigation' ) }>
			<button
				className={ classNames(
					'stats-period-navigation__previous',
					disablePreviousArrow && 'is-disabled'
				) }
				onClick={ disablePreviousArrow ? undefined : () => handleClickPrevious() }
				tabIndex={ ! disablePreviousArrow ? 0 : -1 }
			>
				<Icon className="gridicon" icon={ arrowLeft } />
			</button>
			<button
				className={ classNames(
					'stats-period-navigation__next',
					disableNextArrow && 'is-disabled'
				) }
				onClick={ disableNextArrow ? undefined : () => handleClickNext() }
				tabIndex={ ! disableNextArrow ? 0 : -1 }
			>
				<Icon className="gridicon" icon={ arrowRight } />
			</button>
		</div>
	);
}

export default NavigationArrows;
