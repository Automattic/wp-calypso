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
	const [ activeIndex, setActiveIndex ] = useState< number | string >( -1 );
	const [ groupedIndexes, setGroupedIndexes ] = useState< any >( {} );
	const { current: shadowListItems } = useRef< HTMLButtonElement[] >( [] );

	const assignRef = ( index: number, element: HTMLButtonElement ) => {
		shadowListItems[ index ] = element;
	};

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

		return children
			.filter( ( _child, index ) => ! groupedIndexes[ index ] )
			.map( ( child, index ) => (
				<ToolbarButton
					key={ `shadow-item-${ index }` }
					isActive={ activeIndex === index }
					onClick={ () => {
						setActiveIndex( index );
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
							isActive={ activeIndex === 'more' }
							onClick={ () => {
								setActiveIndex( 'more' );
								onToggle();
							} }
						>
							More
							<Icon icon="arrow-down" />
						</ToolbarButton>
					) }
					renderContent={ ( { onClose } ) => (
						<MenuGroup>
							<MenuItem onClick={ onClose }>Up</MenuItem>
							<MenuItem onClick={ onClose }>Down</MenuItem>
							<MenuItem onClick={ onClose }>Left</MenuItem>
							<MenuItem onClick={ onClose }>Right</MenuItem>
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
