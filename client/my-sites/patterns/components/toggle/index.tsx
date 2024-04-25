import { Tooltip } from '@wordpress/components';
import classNames from 'classnames';
import { Children, cloneElement, createRef, forwardRef, useLayoutEffect, useRef } from 'react';
import { LocalizedLink } from 'calypso/my-sites/patterns/components/localized-link';

import './style.scss';

type PatternLibraryToggleOptionProps = Omit< JSX.IntrinsicElements[ 'a' ], 'onChange' > & {
	onChange?( value: string ): void;
	tooltipText: string;
	value: string;
};

export const PatternLibraryToggleOption = forwardRef<
	HTMLAnchorElement,
	PatternLibraryToggleOptionProps
>( ( { className, children, href, onChange, tooltipText, value, ...props }, ref ) => {
	return (
		<Tooltip text={ tooltipText } { ...{ style: { maxWidth: '200px', top: '3px' } } }>
			<LocalizedLink
				{ ...props }
				className={ classNames( 'pattern-library__toggle-option', className ) }
				href={ href }
				onClick={ () => {
					onChange?.( value );
				} }
				ref={ ref }
			>
				{ children }
			</LocalizedLink>
		</Tooltip>
	);
} );

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
	const ref = useRef< HTMLDivElement >( null );
	const prevSelectionRef = useRef< string >( selected );

	const options = Children.map( children, ( child ) => child.props.value );
	const refs = Children.map( children, () => createRef< HTMLAnchorElement >() );

	const onChangeGuarded: PatternLibraryToggleProps[ 'onChange' ] = ( value ) => {
		if ( value !== selected ) {
			onChange?.( value );
		}
	};

	// Animate the backdrop element to move from the previously selected option to the new one using
	// the FLIP principle
	useLayoutEffect( () => {
		const activeOptionIndex = options.indexOf( selected );
		const activeOptionRef = refs[ activeOptionIndex ];

		const prevOptionIndex = options.indexOf( prevSelectionRef.current );
		const prevOptionRef = refs[ prevOptionIndex ];

		prevSelectionRef.current = selected;

		if ( activeOptionRef?.current && prevOptionRef?.current ) {
			const backdrop = ref.current?.querySelector< HTMLDivElement >(
				'.pattern-library__toggle-backdrop'
			);
			const activeCoords = activeOptionRef.current.getBoundingClientRect();
			const lastSelectionCoords = prevOptionRef.current.getBoundingClientRect();
			const offset = lastSelectionCoords.left - activeCoords.left;

			if ( backdrop ) {
				backdrop.animate( [ { transform: `translateX(${ offset }px)` }, { transform: `none` } ], {
					easing: 'ease',
					duration: 200,
				} );
			}
		}
	}, [ selected ] );

	return (
		<div { ...props } className={ classNames( 'pattern-library__toggle', className ) } ref={ ref }>
			{ Children.map( children, ( child, index ) =>
				cloneElement( child, {
					children: (
						<>
							{ child.props.value === selected && (
								<div className="pattern-library__toggle-backdrop" />
							) }
							{ child.props.children }
						</>
					),
					className: classNames( child.props.className, {
						'is-active': child.props.value === selected,
					} ),
					onChange: onChangeGuarded,
					ref: refs[ index ],
				} )
			) }
		</div>
	);
}
