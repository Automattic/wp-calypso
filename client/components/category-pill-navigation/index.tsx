import { SelectDropdown } from '@automattic/components';
import { addLocaleToPathLocaleInFront, useLocale } from '@automattic/i18n-utils';
import { useMobileBreakpoint } from '@automattic/viewport-react';
import { Button } from '@wordpress/components';
import { useEffect, useState, useRef } from '@wordpress/element';
import { Icon, chevronLeft, chevronRight } from '@wordpress/icons';
import clsx from 'clsx';
import { useRtl } from 'i18n-calypso';
import { LocalizedLink } from 'calypso/my-sites/patterns/components/localized-link';

import './style.scss';

type CategoryPillNavigationProps = {
	buttons?: {
		icon: React.ReactElement< typeof Icon >;
		label: string;
		id: string;
		link: string;
		isActive?: boolean;
	}[];
	categories: {
		id: string;
		label?: string;
		link: string;
	}[];
	selectedCategoryId: string;
	onSelect?: ( selectedId: string ) => void;
};

export const CategoryPillNavigation = ( {
	buttons,
	categories,
	selectedCategoryId,
	onSelect = () => {},
}: CategoryPillNavigationProps ) => {
	const locale = useLocale();
	const isMobile = useMobileBreakpoint();
	const [ showLeftArrow, setShowLeftArrow ] = useState( false );
	const [ showRightArrow, setShowRightArrow ] = useState( false );
	const listInnerRef = useRef< HTMLDivElement | null >( null );
	const isRtl = useRtl();

	const checkScrollArrows = () => {
		if ( ! listInnerRef.current ) {
			return;
		}

		const { scrollLeft, scrollWidth, clientWidth } = listInnerRef.current;

		const roundedScrollLeft = Math.floor( scrollLeft );
		const scrollLeftAbs = Math.abs( roundedScrollLeft ); // adjust RTL negative values

		setShowLeftArrow( scrollLeftAbs > 0 );
		setShowRightArrow( scrollLeftAbs + 1 < scrollWidth - clientWidth ); // +1 to account for rounding errors
	};

	const scrollTo = ( direction: 'right' | 'left' ) => {
		if ( ! listInnerRef.current ) {
			return;
		}

		let left = listInnerRef.current.clientWidth / 2;

		if ( direction === 'left' ) {
			left *= -1;
		}

		listInnerRef.current?.scrollBy( { left, behavior: 'smooth' } );
	};

	useEffect( () => {
		if ( ! listInnerRef.current ) {
			return;
		}

		checkScrollArrows();

		const target = listInnerRef.current?.querySelector( '.is-active' );

		if ( ! target ) {
			return;
		}

		const targetCoords = target.getBoundingClientRect();
		const listInnerCoords = listInnerRef.current.getBoundingClientRect();
		const listInnerHalfWidth = listInnerCoords.width / 2 - targetCoords.width / 2;

		listInnerRef.current?.scrollBy( {
			left: targetCoords.left - listInnerCoords.left - listInnerHalfWidth,
			behavior: 'smooth',
		} );
	}, [ selectedCategoryId ] );

	if ( isMobile ) {
		const selectedItem =
			buttons?.find( ( { isActive } ) => isActive ) ||
			categories.find( ( { id } ) => id === selectedCategoryId );
		return (
			<div className="category-pill-navigation">
				<SelectDropdown
					className="category-pill-navigation__mobile-select"
					selectedText={ selectedItem?.label }
				>
					{ buttons?.map( ( button ) => (
						<SelectDropdown.Item
							key={ button.label }
							onClick={ () => onSelect( button.id ) }
							path={ addLocaleToPathLocaleInFront( button.link, locale ) }
							selected={ button.isActive }
						>
							{ button.label }
						</SelectDropdown.Item>
					) ) }
					{ categories?.map( ( category ) => (
						<SelectDropdown.Item
							key={ category.id }
							onClick={ () => onSelect( category.id ) }
							path={ addLocaleToPathLocaleInFront( category.link, locale ) }
							selected={ category.id === selectedCategoryId }
						>
							{ category.label }
						</SelectDropdown.Item>
					) ) }
				</SelectDropdown>
			</div>
		);
	}

	return (
		<div className="category-pill-navigation">
			{ buttons && (
				<>
					{ buttons.map( ( button ) => (
						<LocalizedLink
							key={ button.label }
							href={ button.link }
							onClick={ () => onSelect( button.id ) }
							className={ clsx( 'category-pill-navigation__button', {
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

			<div className="category-pill-navigation__list">
				{ showLeftArrow && (
					<Button
						className="category-pill-navigation__arrow"
						onClick={ () => scrollTo( ! isRtl ? 'left' : 'right' ) }
					>
						<Icon icon={ isRtl ? chevronLeft : chevronRight } size={ 28 } />
					</Button>
				) }

				{ showRightArrow && (
					<Button
						className="category-pill-navigation__arrow right"
						onClick={ () => scrollTo( ! isRtl ? 'right' : 'left' ) }
					>
						<Icon icon={ isRtl ? chevronLeft : chevronRight } size={ 28 } />
					</Button>
				) }

				<div
					className="category-pill-navigation__list-inner"
					ref={ listInnerRef }
					onScroll={ checkScrollArrows }
				>
					{ categories.map( ( category ) => (
						<LocalizedLink
							key={ category.id }
							href={ category.link }
							onClick={ () => onSelect( category.id ) }
							className={ clsx( 'category-pill-navigation__button', {
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
