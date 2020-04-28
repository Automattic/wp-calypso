/**
 * External dependencies
 */
import React from 'react';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import Gridicon from 'components/gridicon';

const NavItem = ( { text, isCompleted, isCurrent, onClick } ) => {
	return (
		<button
			className={ classnames( 'nav-item', {
				'is-current': isCurrent,
			} ) }
			onClick={ onClick }
		>
			<div className="nav-item__status">
				{ isCompleted && <Gridicon icon="checkmark" size={ 18 } /> }
			</div>
			<div className="nav-item__text">
				<h6>{ text }</h6>
			</div>
		</button>
	);
};

export default NavItem;
