import { ToolbarGroup, ToolbarButton, Dropdown, MenuItem, MenuGroup } from '@wordpress/components';
import { Icon, chevronDown } from '@wordpress/icons';
import classnames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { ReactChild, useCallback, useEffect, useRef, useState } from 'react';

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
}: {
	children: ReactChild[];
	className?: string;
	hideRatio?: number;
	showRatio?: number;
	rootMargin?: string;
	onClick?: ( index: number ) => void;
	initialActiveIndex?: number;
} ) {
	const classes = classnames( 'responsive-toolbar-group__dropdown', className );

	const containerRef = useRef< HTMLDivElement >( null );
	const [ calculatedOnce, setCalculatedOnce ] = useState< boolean >( false );
	const [ activeIndex, setActiveIndex ] = useState< number >( initialActiveIndex );
	const [ groupedIndexes, setGroupedIndexes ] = useState< GroupedIndexStore >( {} );
	const { current: shadowListItems } = useRef< HTMLButtonElement[] >( [] );
	const translate = useTranslate();

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
					isActive={ activeIndex === parseInt( index ) }
					onClick={ () => {
						setActiveIndex( parseInt( index ) );
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
				<Dropdown
					renderToggle={ ( { onToggle } ) => (
						<ToolbarButton
							className={ classnames(
								'responsive-toolbar-group__more-item',
								'responsive-toolbar-group__button-item'
							) }
							isActive={ groupedIndexes[ activeIndex ] }
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
											setActiveIndex( parseInt( index ) );
											onClick( parseInt( index ) );
											onClose();
										} }
										className={ classnames(
											'responsive-toolbar-group__menu-item',
											activeIndex === parseInt( index ) ? 'is-selected' : ''
										) }
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
		if ( ! containerRef.current ) return;

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
		setActiveIndex( initialActiveIndex );
	}, [ initialActiveIndex ] );

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
}
