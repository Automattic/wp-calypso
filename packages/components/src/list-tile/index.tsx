/* eslint-disable no-nested-ternary */
import clsx from 'clsx';
import React, { cloneElement, isValidElement } from 'react';
import './style.scss';

type Props = {
	title: string | React.ReactElement;
	subtitle: string | React.ReactElement;
	leading?: React.ReactNode | React.ReactElement;
	trailing?: React.ReactNode | React.ReactElement;
	className?: string;
	contentClassName?: string;
};

export const ListTile = ( {
	className,
	contentClassName,
	title,
	subtitle,
	leading,
	trailing,
}: Props ) => {
	if ( typeof title === 'string' ) {
		title = <h2 className="list-tile__title"> { title } </h2>;
	}
	if ( typeof subtitle === 'string' ) {
		subtitle = <span className="list-tile__subtitle"> { subtitle } </span>;
	}

	const leadingElement =
		typeof leading === 'string' ? (
			<div className="list-tile__leading">{ leading }</div>
		) : isValidElement< { className: string } >( leading ) ? (
			cloneElement( leading, {
				className: clsx( 'list-tile__leading', leading.props.className ),
			} )
		) : null;

	const trailingElement =
		typeof trailing === 'string' ? (
			<div className="list-tile__trailing">{ trailing }</div>
		) : isValidElement< { className: string } >( trailing ) ? (
			cloneElement( trailing, {
				className: clsx( 'list-tile__trailing', trailing.props.className ),
			} )
		) : null;

	return (
		<div className={ clsx( 'list-tile', className ) }>
			{ leadingElement }
			<div className={ clsx( 'list-tile__content', contentClassName ) }>
				{ title }
				{ subtitle }
			</div>
			{ trailingElement }
		</div>
	);
};
