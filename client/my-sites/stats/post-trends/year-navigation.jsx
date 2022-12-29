import { Icon, arrowLeft, arrowRight } from '@wordpress/icons';
import classNames from 'classnames';

const YearNavigation = ( { onYearChange, disablePreviousArrow, disableNextArrow } ) => {
	const handleClickArrow = ( next ) => {
		onYearChange( next );
	};

	const onKeyDown = ( event, next ) => {
		if ( event.key === 'Enter' || event.key === 'Space' ) {
			handleClickArrow( next );
		}
	};

	return (
		<div className={ classNames( 'post-trends-year-navigation' ) }>
			<button
				className={ classNames(
					'post-trends-year-navigation__previous',
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
					'post-trends-year-navigation__next',
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
};

export default YearNavigation;
