import { Icon, arrowLeft, arrowRight } from '@wordpress/icons';
import classNames from 'classnames';

function NavigationArrows( {
	disableNextArrow,
	disablePreviousArrow,
	handleClickArrow,
	onKeyDown,
} ) {
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
	const handleKeyNext = ( e ) => {
		// eslint-disable-next-line no-console
		console.log( 'key next' );
		onKeyDown( e, true );
	};
	const handleKeyPrevious = ( e ) => {
		// eslint-disable-next-line no-console
		console.log( 'key previous' );
		onKeyDown( e );
	};
	return (
		<div className={ classNames( 'stats-period-navigation', 'stats-year-navigation' ) }>
			<button
				className={ classNames(
					'stats-period-navigation__previous',
					disablePreviousArrow && 'is-disabled'
				) }
				onClick={ disablePreviousArrow ? undefined : () => handleClickPrevious() }
				onKeyDown={ disablePreviousArrow ? undefined : ( e ) => handleKeyPrevious( e ) }
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
				onKeyDown={ disableNextArrow ? undefined : ( e ) => handleKeyNext( e ) }
				tabIndex={ ! disableNextArrow ? 0 : -1 }
			>
				<Icon className="gridicon" icon={ arrowRight } />
			</button>
		</div>
	);
}

export default NavigationArrows;
