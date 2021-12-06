import classNames from 'classnames';
import React from 'react';
import './style.scss';
import { TwoColumnsLayoutProps } from './types';

const TwoColumnsLayout = ( {
	className = '',
	content,
	sidebar,
}: TwoColumnsLayoutProps ): JSX.Element => {
	return (
		<div className={ classNames( 'two-columns-layout', className ) }>
			<div className="two-columns-layout__content">{ content }</div>
			<div className="two-columns-layout__sidebar">{ sidebar }</div>
		</div>
	);
};

export default TwoColumnsLayout;
