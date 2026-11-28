import clsx from 'clsx';
import InfoPopover from 'calypso/components/info-popover';
import type { ElementType, FC, PropsWithChildren, ReactNode } from 'react';
import './style.scss';

export interface Props extends PropsWithChildren {
	align?: 'center' | 'left' | 'right';
	as?: 'header' | 'div';
	brandFont?: boolean;
	className?: string;
	compactOnMobile?: boolean;
	hasScreenOptions?: boolean;
	headerText: ReactNode;
	id?: string;
	isSecondary?: boolean;
	screenReader?: ReactNode;
	subHeaderAs?: ElementType;
	subHeaderText?: ReactNode;
	tooltipText?: ReactNode;
}

const FormattedHeader: FC< Props > = ( {
	align = 'center',
	as: Header = 'header',
	brandFont = false,
	children,
	className,
	compactOnMobile = false,
	hasScreenOptions,
	headerText,
	id = '',
	isSecondary = false,
	screenReader = null,
	subHeaderAs: SubHeaderAs = 'p',
	subHeaderText,
	tooltipText,
} ) => {
	const classes = clsx( 'formatted-header', className, {
		'is-without-subhead': ! subHeaderText,
		'is-compact-on-mobile': compactOnMobile,
		'is-left-align': 'left' === align,
		'is-right-align': 'right' === align,
		'has-screen-options': hasScreenOptions,
	} );

	const headerClasses = clsx( 'formatted-header__title', { 'wp-brand-font': brandFont } );
	const tooltip = tooltipText && (
		<InfoPopover icon="help-outline" position="right" iconSize={ 18 } showOnHover>
			{ tooltipText }
		</InfoPopover>
	);

	return (
		<Header id={ id } className={ classes }>
			<div>
				{ ! isSecondary && (
					<h1 className={ headerClasses }>
						{ headerText } { tooltip }
					</h1>
				) }
				{ isSecondary && (
					<h2 className={ headerClasses }>
						{ headerText } { tooltip }
					</h2>
				) }
				{ screenReader && <h2 className="screen-reader-text">{ screenReader }</h2> }
				{ subHeaderText && (
					<SubHeaderAs className="formatted-header__subtitle">{ subHeaderText }</SubHeaderAs>
				) }
			</div>
			{ children }
		</Header>
	);
};

export default FormattedHeader;
