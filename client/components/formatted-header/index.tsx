import clsx from 'clsx';
import InfoPopover from 'calypso/components/info-popover';
import { preventWidows } from 'calypso/lib/formatting';
import type { ElementType, FC, PropsWithChildren, ReactNode } from 'react';
import './style.scss';

interface Props extends PropsWithChildren {
	align?: 'center' | 'left' | 'right';
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
	disablePreventWidows?: boolean;
}

const FormattedHeader: FC< Props > = ( {
	align = 'center',
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
	disablePreventWidows,
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

	const formattedHeaderText = disablePreventWidows ? headerText : preventWidows( headerText, 2 );
	const formattedSubHeaderText = disablePreventWidows
		? subHeaderText
		: preventWidows( subHeaderText, 2 );

	return (
		<header id={ id } className={ classes }>
			<div>
				{ ! isSecondary && (
					<h1 className={ headerClasses }>
						{ formattedHeaderText } { tooltip }
					</h1>
				) }
				{ isSecondary && (
					<h2 className={ headerClasses }>
						{ formattedHeaderText } { tooltip }
					</h2>
				) }
				{ screenReader && <h2 className="screen-reader-text">{ screenReader }</h2> }
				{ formattedSubHeaderText && (
					<SubHeaderAs className="formatted-header__subtitle">
						{ formattedSubHeaderText }
					</SubHeaderAs>
				) }
			</div>
			{ children }
		</header>
	);
};

export default FormattedHeader;
