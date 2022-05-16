import {
	ToolbarGroup,
	ToolbarButton,
	Dropdown,
	MenuItem,
	MenuGroup,
	Icon,
} from '@wordpress/components';
import classnames from 'classnames';
import { useCallback, useEffect, useRef, useState } from 'react';

import './style.scss';

const ResponsiveToolbarGroup = ( {
	children,
	className = '',
	hideRatio = 0.9,
	showRatio = 1,
	rootMargin = '0px',
}: {
	children: any[];
	className?: string;
	hideRatio?: number;
	showRatio?: number;
	rootMargin?: string;
} ) => {
	const classes = classnames( 'responsive-toolbar-group', className );

	const containerRef = useRef< HTMLDivElement >( null );
	const [ calculatedOnce, setCalculatedOnce ] = useState< boolean >( false );
	const [ activeIndex, setActiveIndex ] = useState< number >( -1 );
	const [ groupedIndexes, setGroupedIndexes ] = useState< any >( {} );
	const { current: shadowListItems } = useRef< HTMLButtonElement[] >( [] );

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
					key={ `shadow-item-${ index }` }
					isActive={ activeIndex === parseInt( index ) }
					onClick={ () => {
						setActiveIndex( parseInt( index ) );
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
			const label = groupedIndexes[ activeIndex ] ? children[ activeIndex ] : 'More';

			return (
				<Dropdown
					renderToggle={ ( { onToggle } ) => (
						<ToolbarButton
							isActive={ groupedIndexes[ activeIndex ] }
							onClick={ () => {
								onToggle();
							} }
						>
							{ label }
							<Icon icon="arrow-down" />
						</ToolbarButton>
					) }
					renderContent={ ( { onClose } ) => (
						<MenuGroup>
							{ getChildrenToRender()
								.filter( ( { grouped, index } ) => grouped && parseInt( index ) !== activeIndex )
								.map( ( { index, child } ) => (
									<MenuItem
										key={ `menu-item-${ index }` }
										onClick={ () => {
											setActiveIndex( parseInt( index ) );
											onClose();
										} }
										isSelected={ activeIndex === parseInt( index ) }
										className="responsive-toolbar-group__menu-item"
									>
										{ child }
									</MenuItem>
								) ) }
						</MenuGroup>
					) }
				/>
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
					setGroupedIndexes( ( state: any ) => ( {
						...state,
						[ index ]: false,
						[ index - 1 ]: false,
					} ) );
				} else {
					setGroupedIndexes( ( state: any ) => ( { ...state, [ index - 1 ]: false } ) );
				}
			}

			// always hide sets of two to give space to the "more" item.
			if ( entry.intersectionRatio <= hideRatio ) {
				setGroupedIndexes( ( state: any ) => ( {
					...state,
					[ index ]: true,
					[ index - 1 ]: true,
				} ) );
			}

			setCalculatedOnce( true );
		},
		[ children, hideRatio, showRatio ]
	);

	useEffect( () => {
		if ( ! containerRef.current ) return;

		const observers: IntersectionObserver[] = [];

		setCalculatedOnce( false );

		shadowListItems.forEach( ( listItem, index ) => {
			observers[ index ] = new IntersectionObserver(
				interceptionCallback.bind( ResponsiveToolbarGroup, index ),
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

	return (
		<div className={ classes } ref={ containerRef }>
			<ToolbarGroup className="responsive-toolbar-group__full-list">
				{ renderChildren( 'all' ) }
				{ maybeRenderMore( true ) }
			</ToolbarGroup>
			<ToolbarGroup
				className={ classnames(
					'responsive-toolbar-group__grouped-list',
					calculatedOnce ? 'is-visible' : ''
				) }
			>
				{ renderChildren() }
				{ maybeRenderMore() }
			</ToolbarGroup>
		</div>
	);
};

export default ResponsiveToolbarGroup;
