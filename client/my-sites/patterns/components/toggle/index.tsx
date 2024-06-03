import { Tooltip } from '@wordpress/components';
import clsx from 'clsx';
import {
	Children,
	cloneElement,
	createRef,
	forwardRef,
	useEffect,
	useLayoutEffect,
	useRef,
} from 'react';
import { LocalizedLink } from 'calypso/my-sites/patterns/components/localized-link';

import './style.scss';

// We do this to silence a noisy React warning about `useLayoutEffect` not playing well with SSR.
// See https://reactjs.org/link/uselayouteffect-ssr
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

type PatternLibraryToggleOptionProps = Omit< JSX.IntrinsicElements[ 'a' ], 'onClick' > & {
	onClick?( value: string ): void;
	tooltipText: string;
	value: string;
};

export const PatternLibraryToggleOption = forwardRef<
	HTMLAnchorElement,
	PatternLibraryToggleOptionProps
>( ( { className, children, href, onClick, tooltipText, value, ...props }, ref ) => {
	return (
		<Tooltip text={ tooltipText } { ...{ style: { maxWidth: '200px', top: '3px' } } }>
			<LocalizedLink
				{ ...props }
				className={ clsx( 'pattern-library__toggle-option', className ) }
				href={ href }
				onClick={ () => {
					onClick?.( value );
				} }
				ref={ ref }
			>
				{ children }
			</LocalizedLink>
		</Tooltip>
	);
} );

type PatternLibraryToggleProps = {
	className?: string;
	children: React.ReactElement< PatternLibraryToggleOptionProps >[];
	onChange: PatternLibraryToggleOptionProps[ 'onClick' ];
	selected: string;
};

export function PatternLibraryToggle( {
	className,
	children,
	onChange,
	selected,
}: PatternLibraryToggleProps ) {
	const wrapperRef = useRef< HTMLDivElement >( null );
	const prevSelectionRef = useRef< string >( selected );

	const options = Children.map( children, ( child ) => child.props.value );
	const optionRefs = Children.map( children, () => createRef< HTMLAnchorElement >() );

	// Animate the backdrop element to move from the previously selected option to the new one using
	// the FLIP principle
	useIsomorphicLayoutEffect( () => {
		if ( selected === prevSelectionRef.current ) {
			return;
		}

		const activeOptionIndex = options.indexOf( selected );
		const activeOptionRef = optionRefs[ activeOptionIndex ];

		const prevOptionIndex = options.indexOf( prevSelectionRef.current );
		const prevOptionRef = optionRefs[ prevOptionIndex ];

		prevSelectionRef.current = selected;

		if ( activeOptionRef?.current && prevOptionRef?.current ) {
			const backdrop = wrapperRef.current?.querySelector< HTMLDivElement >(
				'.pattern-library__toggle-backdrop'
			);
			const activeCoords = activeOptionRef.current.getBoundingClientRect();
			const lastSelectionCoords = prevOptionRef.current.getBoundingClientRect();
			const offset = lastSelectionCoords.left - activeCoords.left;

			backdrop?.animate( [ { transform: `translateX(${ offset }px)` }, { transform: `none` } ], {
				easing: 'ease',
				duration: 200,
			} );
		}
	}, [ selected ] );

	return (
		<div className={ clsx( 'pattern-library__toggle', className ) } ref={ wrapperRef }>
			{ Children.map( children, ( child, index ) =>
				cloneElement< PatternLibraryToggleOptionProps >( child, {
					children: (
						<>
							{ child.props.value === selected && (
								<div className="pattern-library__toggle-backdrop" />
							) }
							{ child.props.children }
						</>
					),
					className: clsx( child.props.className, {
						'is-active': child.props.value === selected,
					} ),
					onClick( value ) {
						if ( value !== selected ) {
							onChange?.( value );
						}
					},
					ref: optionRefs[ index ],
				} )
			) }
		</div>
	);
}
