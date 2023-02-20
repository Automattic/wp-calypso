/* eslint-disable no-nested-ternary */
import classNames from 'classnames';
import { cloneElement, isValidElement, ReactElement, ReactNode } from 'react';
import './style.scss';

type Props = {
	title: string | ReactElement;
	subtitle: string | ReactElement;
	leading?: ReactNode | ReactElement;
	trailing?: ReactNode | ReactElement;
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
			cloneElement( leading as ReactElement< { className: string } >, {
				className: classNames( 'list-tile__leading', leading.props.className ),
			} )
		) : null;

	const trailingElement =
		typeof trailing === 'string' ? (
			<div className="list-tile__trailing">{ trailing }</div>
		) : isValidElement( trailing ) ? (
			cloneElement( trailing as ReactElement< { className: string } >, {
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
