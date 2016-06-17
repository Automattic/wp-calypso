/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import Gridicon from 'components/gridicon';

export default function GridiconListItem( props ) {
	const { children, icon } = props;
	const className = classNames( 'gridicon-list__item', {
		'gridicon-list__item-no-icon': !icon
	}, props.className );
	return (
		<li { ...props } className={ className } >
			{ icon && <Gridicon className="gridicon-list__item-icon" size={ 18 } icon={ icon } /> }
			{ children }
		</li>
	);
}
