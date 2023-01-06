import { Icon, arrowLeft, arrowRight } from '@wordpress/icons';
import classNames from 'classnames';

function NavigationArrows( {
	disableNextArrow,
	disablePreviousArrow,
	handleClickArrow,
	onKeyDown,
} ) {
	return (
		<div className={ classNames( 'stats-period-navigation', 'stats-year-navigation' ) }>
			<button
				className={ classNames(
					'stats-period-navigation__previous',
					disablePreviousArrow && 'is-disabled'
				) }
				onClick={ disablePreviousArrow ? undefined : () => handleClickArrow() }
				onKeyDown={ disablePreviousArrow ? undefined : ( e ) => onKeyDown( e ) }
				tabIndex={ ! disablePreviousArrow ? 0 : -1 }
			>
				<Icon className="gridicon" icon={ arrowLeft } />
			</button>
			<button
				className={ classNames(
					'stats-period-navigation__next',
					disableNextArrow && 'is-disabled'
				) }
				onClick={ disableNextArrow ? undefined : () => handleClickArrow( true ) }
				onKeyDown={ disableNextArrow ? undefined : ( e ) => onKeyDown( e, true ) }
				tabIndex={ ! disableNextArrow ? 0 : -1 }
			>
				<Icon className="gridicon" icon={ arrowRight } />
			</button>
		</div>
	);
}

export default NavigationArrows;
