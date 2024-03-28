import page from '@automattic/calypso-router';
import { SelectDropdown } from '@automattic/components';
import { addLocaleToPathLocaleInFront } from '@automattic/i18n-utils';
import { useMobileBreakpoint } from '@automattic/viewport-react';
import { Button } from '@wordpress/components';
import { useEffect, useState, useRef } from '@wordpress/element';
import { Icon, chevronRight } from '@wordpress/icons';
import classnames from 'classnames';
import { LocalizedLink } from 'calypso/my-sites/patterns/components/localized-link';

import './style.scss';

type CategoryPillNavigationProps = {
	buttons?: {
		icon: React.ReactElement< typeof Icon >;
		label: string;
		link: string;
		isActive?: boolean;
	}[];
	categories: {
		id: string;
		label?: string;
		link: string;
	}[];
	selectedCategoryId: string;
};

export const CategoryPillNavigation = ( {
	buttons,
	categories,
	selectedCategoryId,
}: CategoryPillNavigationProps ) => {
	const isMobile = useMobileBreakpoint();
	const [ showLeftArrow, setShowLeftArrow ] = useState( false );
	const [ showRightArrow, setShowRightArrow ] = useState( false );
	const listRef = useRef< HTMLDivElement | null >( null );

	const checkScrollArrows = () => {
		if ( ! listRef.current ) {
			return;
		}

		const { scrollLeft, scrollWidth, clientWidth } = listRef.current;
		setShowLeftArrow( scrollLeft > 0 );
		setShowRightArrow( Math.ceil( scrollLeft ) < scrollWidth - clientWidth );
	};

	const scrollTo = ( direction: 'right' | 'left' ) => {
		if ( ! listRef.current ) {
			return;
		}

		let left = listRef.current.clientWidth / 2;

		if ( direction === 'left' ) {
			left *= -1;
		}

		listRef.current?.scrollBy( { left, behavior: 'smooth' } );
	};

	useEffect( () => {
		if ( ! listRef.current ) {
			return;
		}

		checkScrollArrows();

		const target = listRef.current.querySelector( '.is-active' );

		target?.scrollIntoView( {
			behavior: 'smooth',
			block: 'nearest',
			inline: 'center',
		} );
	}, [ selectedCategoryId ] );

	if ( isMobile ) {
		const currentUrl =
			typeof window === 'undefined' ? '' : window.location.pathname + window.location.search;

		const selectedText = [ ...categories, ...( buttons || [] ) ].find(
			( { link } ) => currentUrl === addLocaleToPathLocaleInFront( link )
		)?.label;

		return (
			<div className="category-pill-navigation">
				<SelectDropdown
					className="category-pill-navigation__mobile-select"
					selectedText={ selectedText }
				>
					{ buttons &&
						buttons.map( ( button ) => {
							const value = addLocaleToPathLocaleInFront( button.link );

							return (
								<SelectDropdown.Item
									key={ button.label }
									selected={ value === currentUrl }
									onClick={ () => page( value ) }
								>
									{ button.label }
								</SelectDropdown.Item>
							);
						} ) }
					{ categories &&
						categories.map( ( category ) => {
							const value = addLocaleToPathLocaleInFront( category.link );

							return (
								<SelectDropdown.Item
									key={ category.id }
									selected={ value === currentUrl }
									onClick={ () => page( value ) }
								>
									{ category.label }
								</SelectDropdown.Item>
							);
						} ) }
				</SelectDropdown>
			</div>
		);
	}

	return (
		<div className="category-pill-navigation">
			<div className="category-pill-navigation__list">
				{ showLeftArrow && (
					<Button className="category-pill-navigation__arrow" onClick={ () => scrollTo( 'left' ) }>
						<Icon icon={ chevronRight } size={ 28 } />
					</Button>
				) }
				{ showRightArrow && (
					<Button
						className="category-pill-navigation__arrow right"
						onClick={ () => scrollTo( 'right' ) }
					>
						<Icon icon={ chevronRight } size={ 28 } />
					</Button>
				) }
				<div
					className="category-pill-navigation__list-inner"
					ref={ listRef }
					onScroll={ checkScrollArrows }
				>
					{ buttons && (
						<>
							{ buttons.map( ( button ) => (
								<LocalizedLink
									key={ button.label }
									href={ button.link }
									className={ classnames( 'category-pill-navigation__button', {
										'is-active': button.isActive,
									} ) }
								>
									{ button.icon }
									{ button.label }
								</LocalizedLink>
							) ) }
							<div className="category-pill-navigation__button-divider" />
						</>
					) }
					{ categories.map( ( category ) => (
						<LocalizedLink
							key={ category.id }
							href={ category.link }
							className={ classnames( 'category-pill-navigation__button', {
								'is-active': category.id === selectedCategoryId,
							} ) }
						>
							{ category.label }
						</LocalizedLink>
					) ) }
				</div>
			</div>
		</div>
	);
};
