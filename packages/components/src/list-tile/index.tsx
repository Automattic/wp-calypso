/* eslint-disable no-nested-ternary */
import classNames from 'classnames';
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
		) : isValidElement( leading ) ? (
			cloneElement( leading, {
				className: classNames( 'list-tile__leading', leading.props.className ),
			} )
		) : null;

	const trailingElement =
		typeof trailing === 'string' ? (
			<div className="list-tile__trailing">{ trailing }</div>
		) : isValidElement( trailing ) ? (
			cloneElement( trailing, {
				className: classNames( 'list-tile__trailing', trailing.props.className ),
			} )
		) : null;

	return (
		<div className={ classNames( 'list-tile', className ) }>
			{ leadingElement }
			<div className={ classNames( 'list-tile__content', contentClassName ) }>
				{ title }
				{ subtitle }
			</div>
			{ trailingElement }
		</div>
	);
};
