import { Button } from '@wordpress/components';
import { useEffect, useState, useRef } from '@wordpress/element';
import { Icon, chevronRight } from '@wordpress/icons';
import classnames from 'classnames';
import { LocalizedLink } from 'calypso/my-sites/patterns/components/localized-link';

import './style.scss';

type CategoryPillNavigationProps = {
	buttons?: {
		icon: JSX.Element;
		label: string;
		link: string;
	}[];
	list: {
		name: string;
		label?: string;
		link: string;
	}[];
	selectedCategory: string;
};

export const CategoryPillNavigation = ( {
	buttons,
	list,
	selectedCategory,
}: CategoryPillNavigationProps ) => {
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
		checkScrollArrows();
	}, [] );

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
									className="category-pill-navigation__button"
								>
									{ button.icon }
									{ button.label }
								</LocalizedLink>
							) ) }
							<div className="category-pill-navigation__button-divider" />
						</>
					) }
					{ list.map( ( category ) => (
						<LocalizedLink
							key={ category.name }
							href={ category.link }
							className={ classnames( 'category-pill-navigation__button', {
								'is-active': category.name === selectedCategory,
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
