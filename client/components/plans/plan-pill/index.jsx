import classNames from 'classnames';

import './style.scss';

export default ( { isInSignup, isInMarketplace, backgroundColor, color, children } ) => {
	const classes = classNames( 'plan-pill', {
		'is-in-signup': isInSignup,
		'is-in-marketplace': isInMarketplace,
	} );
	return (
		<div className={ classes } style={ { backgroundColor, color } }>
			{ children }
		</div>
	);
};
