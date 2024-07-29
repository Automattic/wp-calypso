import clsx from 'clsx';
import React from 'react';
import './style.scss';
import { TwoColumnsLayoutProps } from './types';

const TwoColumnsLayout = ( { className = '', content, sidebar }: TwoColumnsLayoutProps ) => {
	return (
		<div className={ clsx( 'two-columns-layout', className ) }>
			<div className="two-columns-layout__content">{ content }</div>
			<div className="two-columns-layout__sidebar">{ sidebar }</div>
		</div>
	);
};

export default TwoColumnsLayout;
