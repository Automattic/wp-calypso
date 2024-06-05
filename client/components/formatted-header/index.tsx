import clsx from 'clsx';
import { ElementType, FC, PropsWithChildren, ReactNode } from 'react';
import InfoPopover from 'calypso/components/info-popover';
import { preventWidows } from 'calypso/lib/formatting';
import './style.scss';

interface Props extends PropsWithChildren {
	id?: string;
	className?: string;
	brandFont?: boolean;
	headerText: ReactNode;
	subHeaderAs?: ElementType;
	subHeaderText?: ReactNode;
	tooltipText?: ReactNode;
	compactOnMobile?: boolean;
	isSecondary?: boolean;
	align?: 'center' | 'left' | 'right';
	subHeaderAlign?: 'center';
	hasScreenOptions?: boolean;
	children?: ReactNode;
	screenReader?: ReactNode;
}

const FormattedHeader: FC< Props > = ( {
	brandFont = false,
	id = '',
	headerText,
	subHeaderText,
	tooltipText,
	className,
	compactOnMobile = false,
	align = 'center',
	subHeaderAlign,
	isSecondary = false,
	hasScreenOptions,
	subHeaderAs: SubHeaderAs = 'p',
	children,
	screenReader = null,
} ) => {
	const classes = clsx( 'formatted-header', className, {
		'is-without-subhead': ! subHeaderText,
		'is-compact-on-mobile': compactOnMobile,
		'is-left-align': 'left' === align,
		'is-right-align': 'right' === align,
		'has-screen-options': hasScreenOptions,
	} );

	const headerClasses = clsx( 'formatted-header__title', { 'wp-brand-font': brandFont } );
	const subtitleClasses = clsx( 'formatted-header__subtitle', {
		'is-center-align': 'center' === subHeaderAlign,
	} );
	const tooltip = tooltipText && (
		<InfoPopover icon="help-outline" position="right" iconSize={ 18 } showOnHover>
			{ tooltipText }
		</InfoPopover>
	);

	return (
		<header id={ id } className={ classes }>
			<div>
				{ ! isSecondary && (
					<h1 className={ headerClasses }>
						{ preventWidows( headerText, 2 ) } { tooltip }
					</h1>
				) }
				{ isSecondary && (
					<h2 className={ headerClasses }>
						{ preventWidows( headerText, 2 ) } { tooltip }
					</h2>
				) }
				{ screenReader && <h2 className="screen-reader-text">{ screenReader }</h2> }
				{ subHeaderText && (
					<SubHeaderAs className={ subtitleClasses }>
						{ preventWidows( subHeaderText, 2 ) }
					</SubHeaderAs>
				) }
			</div>
			{ children }
		</header>
	);
};

export default FormattedHeader;
