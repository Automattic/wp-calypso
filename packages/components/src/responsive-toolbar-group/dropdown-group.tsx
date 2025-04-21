import {
	ToolbarGroup,
	ToolbarButton,
	Dropdown,
	MenuItem,
	MenuGroup,
	SlotFillProvider,
	Popover,
} from '@wordpress/components';
import { Icon, chevronDown } from '@wordpress/icons';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { ReactNode, useCallback, useEffect, useRef, useState, useMemo } from 'react';

import './style.scss';

interface GroupedIndexStore {
	[ key: string ]: boolean;
}

export default function DropdownGroup( {
	children,
	className = '',
	hideRatio = 0.99,
	showRatio = 1,
	rootMargin = '0px',
	onClick = () => null,
	initialActiveIndex = -1,
	initialActiveIndexes,
	isMultiSelection,
}: {
	children: ReactNode[];
	className?: string;
	hideRatio?: number;
	showRatio?: number;
	rootMargin?: string;
	onClick?: ( index: number ) => void;
	initialActiveIndex?: number;
	initialActiveIndexes?: number[];
	isMultiSelection?: boolean;
} ) {
	const classes = clsx( 'responsive-toolbar-group__dropdown', className );

	const defaultActiveIndexes = useMemo( () => {
		if ( isMultiSelection ) {
			return initialActiveIndexes || [];
		}

		return initialActiveIndex !== -1 ? [ initialActiveIndex ] : [];
	}, [ isMultiSelection, initialActiveIndex, initialActiveIndexes ] );

	const containerRef = useRef< HTMLDivElement >( null );
	const [ calculatedOnce, setCalculatedOnce ] = useState< boolean >( false );
	const [ activeIndexes, setActiveIndexes ] = useState< Set< number > >(
		new Set( defaultActiveIndexes )
	);
	const [ groupedIndexes, setGroupedIndexes ] = useState< GroupedIndexStore >( {} );
	const { current: shadowListItems } = useRef< HTMLButtonElement[] >( [] );
	const translate = useTranslate();

	const onSelect = ( index: number ) => {
		setActiveIndexes( ( currentActiveIndexes: Set< number > ) => {
			if ( ! isMultiSelection ) {
				return new Set( [ index ] );
			}

			if ( ! currentActiveIndexes.has( index ) ) {
				currentActiveIndexes.add( index );
			} else if ( currentActiveIndexes.size > 1 ) {
				currentActiveIndexes.delete( index );
			}

			return currentActiveIndexes;
		} );
	};

	const assignRef = ( index: number, element: HTMLButtonElement ) => {
		shadowListItems[ index ] = element;
	};

	const getChildrenToRender = () =>
		Object.keys( groupedIndexes ).map( ( index ) => ( {
			index,
			grouped: groupedIndexes[ index ],
			child: children[ parseInt( index ) ],
		} ) );

	const renderChildren = ( type = 'grouped' ) => {
		if ( type === 'all' ) {
			return children.map( ( child, index ) => (
				<ToolbarButton
					key={ `shadow-item-${ index }` }
					ref={ ( el: HTMLButtonElement ) => assignRef( index, el ) }
					className="responsive-toolbar-group__button-item"
				>
					{ child }
				</ToolbarButton>
			) );
		}

		return getChildrenToRender()
			.filter( ( { grouped } ) => ! grouped )
			.map( ( { index, child } ) => (
				<ToolbarButton
					key={ `button-item-${ index }` }
					isActive={ activeIndexes.has( parseInt( index ) ) }
					onClick={ () => {
						onSelect( parseInt( index ) );
						onClick( parseInt( index ) );
					} }
					className="responsive-toolbar-group__button-item"
				>
					{ child }
				</ToolbarButton>
			) );
	};

	const maybeRenderMore = ( always = false ) => {
		const containGroupedIndexes = !! Object.values( groupedIndexes ).find( ( index ) => index );

		if ( containGroupedIndexes || always ) {
			return (
				<SlotFillProvider>
					<Popover.Slot />
					<Dropdown
						renderToggle={ ( { onToggle } ) => (
							<ToolbarButton
								className={ clsx(
									'responsive-toolbar-group__more-item',
									'responsive-toolbar-group__button-item'
								) }
								isActive={ Array.from( activeIndexes ).some(
									( index ) => groupedIndexes[ index ]
								) }
								onClick={ () => {
									onToggle();
								} }
							>
								{ translate( 'More' ) }
								<Icon icon={ chevronDown } />
							</ToolbarButton>
						) }
						renderContent={ ( { onClose } ) => (
							<MenuGroup>
								{ getChildrenToRender()
									.filter( ( { grouped } ) => grouped )
									.map( ( { index, child } ) => (
										<MenuItem
											key={ `menu-item-${ index }` }
											onClick={ () => {
												onSelect( parseInt( index ) );
												onClick( parseInt( index ) );
												onClose();
											} }
											className={ clsx(
												'responsive-toolbar-group__menu-item',
												activeIndexes.has( parseInt( index ) ) ? 'is-selected' : ''
											) }
										>
											{ child }
										</MenuItem>
									) ) }
							</MenuGroup>
						) }
					/>
				</SlotFillProvider>
			);
		}

		return;
	};

	// I have to optimize this callback so it doesn't do unnecesary updates
	const interceptionCallback = useCallback(
		( index: number, entries: IntersectionObserverEntry[] ) => {
			const entry = entries[ 0 ];

			if ( index === 0 ) {
				return;
			}

			if ( entry.intersectionRatio >= showRatio ) {
				// is last child becoming visible just showcase it.
				if ( index === children.length - 1 ) {
					setGroupedIndexes( ( state: GroupedIndexStore ) => ( {
						...state,
						[ index ]: false,
						[ index - 1 ]: false,
					} ) );
				} else {
					setGroupedIndexes( ( state: GroupedIndexStore ) => ( {
						...state,
						[ index - 1 ]: false,
					} ) );
				}
			}

			// always hide sets of two to give space to the "more" item.
			if ( entry.intersectionRatio <= hideRatio ) {
				setGroupedIndexes( ( state: GroupedIndexStore ) => ( {
					...state,
					[ index ]: true,
					[ index - 1 ]: true,
				} ) );
			}

			setCalculatedOnce( ( calculated ) => {
				if ( ! calculated ) {
					return true;
				}

				return calculated;
			} );
		},
		[ children, hideRatio, showRatio ]
	);

	useEffect( () => {
		if ( ! containerRef.current ) {
			return;
		}

		const observers: IntersectionObserver[] = [];

		shadowListItems.forEach( ( listItem, index ) => {
			observers[ index ] = new IntersectionObserver(
				interceptionCallback.bind( DropdownGroup, index ),
				{
					root: containerRef.current,
					rootMargin,
					threshold: [ hideRatio, showRatio ],
				}
			);

			observers[ index ].observe( listItem );
		} );

		return () => {
			observers.forEach( ( observer ) => observer.disconnect() );
		};
	}, [ shadowListItems, interceptionCallback, hideRatio, showRatio, rootMargin ] );

	// Reset active on prop change from above
	useEffect( () => {
		setActiveIndexes( new Set( defaultActiveIndexes ) );
	}, [ defaultActiveIndexes ] );

	return (
		<div className={ classes } ref={ containerRef }>
			<ToolbarGroup className="responsive-toolbar-group__full-list">
				{ renderChildren( 'all' ) }
				{ maybeRenderMore( true ) }
			</ToolbarGroup>
			<ToolbarGroup
				className={ clsx( 'responsive-toolbar-group__grouped-list', {
					'is-visible': calculatedOnce,
					'is-multi': isMultiSelection,
				} ) }
			>
				{ renderChildren() }
				{ maybeRenderMore() }
			</ToolbarGroup>
		</div>
	);
}
