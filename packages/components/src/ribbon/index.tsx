/**
 * External dependencies
 */

import React from 'react';
import classNames from 'classnames';

/**
 * Style dependencies
 */
import './style.scss';

type Props = {
	color?: 'green' | undefined;
	children: React.ReactNode;
};

const Ribbon: React.FC< Props > = ( props ) => (
	<div
		className={ classNames( {
			ribbon: true,
			'is-green': props.color === 'green',
		} ) }
	>
		<span className="ribbon__title">{ props.children }</span>
	</div>
);

export default React.memo( Ribbon );
