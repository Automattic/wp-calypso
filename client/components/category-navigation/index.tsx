import { Button } from '@wordpress/components';
import { useEffect, useState, useRef } from '@wordpress/element';
import classnames from 'classnames';

import './style.scss';

type CategoryNavProps = {
	buttons?: {
		icon: string;
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

export const CategoryNavigation = ( { buttons, list, selectedCategory }: CategoryNavProps ) => {
	const [ showLeftArrow, setShowLeftArrow ] = useState( false );
	const [ showRightArrow, setShowRightArrow ] = useState( false );
	const listRef = useRef< HTMLDivElement | null >( null );

	const checkScrollArrows = () => {
		const list = listRef.current;
		if ( ! list ) {
			return;
		}

		const { scrollLeft, scrollWidth, clientWidth } = list;
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
		<div className="category-navigation">
			<div className="category-navigation__list">
				{ showLeftArrow && (
					<Button className="category-navigation__arrow" onClick={ () => scrollTo( 'left' ) } />
				) }
				{ showRightArrow && (
					<Button
						className="category-navigation__arrow right"
						onClick={ () => scrollTo( 'right' ) }
					/>
				) }
				<div
					className="category-navigation__list-inner"
					ref={ listRef }
					onScroll={ checkScrollArrows }
				>
					{ buttons && (
						<>
							{ buttons.map( ( button ) => (
								<a
									key={ button.label }
									href={ button.link }
									className="category-navigation__button"
								>
									{ button.icon && <img src={ button.icon } alt={ button.label } /> }
									{ button.label }
								</a>
							) ) }
							<div className="category-navigation__button-divider" />
						</>
					) }
					{ list.map( ( category ) => (
						<a
							key={ category.name }
							href={ category.link }
							className={ classnames( 'category-navigation__button', {
								'is-active': category.name === selectedCategory,
							} ) }
						>
							{ category.label }
						</a>
					) ) }
				</div>
			</div>
		</div>
	);
};
