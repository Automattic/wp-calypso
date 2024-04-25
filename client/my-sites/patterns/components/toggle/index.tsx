import { Tooltip } from '@wordpress/components';
import classNames from 'classnames';
import { Children, cloneElement } from 'react';
import { LocalizedLink } from 'calypso/my-sites/patterns/components/localized-link';

import './style.scss';

type PatternLibraryToggleOptionProps = Omit< JSX.IntrinsicElements[ 'a' ], 'onChange' > & {
	onChange?( value: string ): void;
	tooltipText: string;
	value: string;
};

export function PatternLibraryToggleOption( {
	className,
	children,
	href,
	onChange,
	tooltipText,
	value,
	...props
}: PatternLibraryToggleOptionProps ) {
	return (
		<Tooltip text={ tooltipText } { ...{ style: { maxWidth: '200px', top: '3px' } } }>
			<LocalizedLink
				className={ classNames( 'pattern-library__toggle-option', className ) }
				href={ href }
				onClick={ () => {
					onChange?.( value );
				} }
				{ ...props }
			>
				{ children }
			</LocalizedLink>
		</Tooltip>
	);
}

type PatternLibraryToggleProps = Omit< JSX.IntrinsicElements[ 'div' ], 'onChange' > & {
	children: React.ReactElement< PatternLibraryToggleOptionProps >[];
	onChange: PatternLibraryToggleOptionProps[ 'onChange' ];
	selected: string;
};

export function PatternLibraryToggle( {
	className,
	children,
	onChange,
	selected,
	...props
}: PatternLibraryToggleProps ) {
	const onChangeGuarded: PatternLibraryToggleProps[ 'onChange' ] = ( value ) => {
		if ( value !== selected ) {
			onChange?.( value );
		}
	};

	return (
		<div className={ classNames( 'pattern-library__toggle', className ) } { ...props }>
			{ Children.map( children, ( child ) =>
				cloneElement( child, {
					className: classNames( child.props.className, {
						'is-active': child.props.value === selected,
					} ),
					onChange: onChangeGuarded,
				} )
			) }
		</div>
	);
}
