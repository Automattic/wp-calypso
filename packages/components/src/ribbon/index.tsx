import classNames from 'classnames';
import React from 'react';
import type { ReactNode, FunctionComponent } from 'react';

/**
 * Style dependencies
 */
import './style.scss';

type Props = {
	color?: 'green' | undefined;
	children: ReactNode;
};

const Ribbon: FunctionComponent< Props > = ( props ) => (
	<div
		className={ classNames( {
			ribbon: true,
			'is-green': props.color === 'green',
		} ) }
	>
		<span className="ribbon__title">{ props.children }</span>
	</div>
);

export default Ribbon;
