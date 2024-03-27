import page from '@automattic/calypso-router';
import { addLocaleToPathLocaleInFront } from '@automattic/i18n-utils';
import { isMobile } from '@automattic/viewport';
import { Button } from '@wordpress/components';
import { useEffect, useState, useRef } from '@wordpress/element';
import { Icon, chevronRight } from '@wordpress/icons';
import classnames from 'classnames';
import FormSelect from 'calypso/components/forms/form-select';
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

	if ( isMobile() ) {
		return (
			<div className="category-pill-navigation">
				<FormSelect
					className="category-pill-navigation__mobile-select"
					value={ window.location.pathname + window.location.search }
					onChange={ ( event: React.ChangeEvent< HTMLSelectElement > ) => {
						page( event.target.value );
					} }
				>
					{ buttons &&
						buttons.map( ( button ) => (
							<option key={ button.label } value={ addLocaleToPathLocaleInFront( button.link ) }>
								{ button.label }
							</option>
						) ) }
					{ categories &&
						categories.map( ( category ) => (
							<option key={ category.id } value={ addLocaleToPathLocaleInFront( category.link ) }>
								{ category.label }
							</option>
						) ) }
				</FormSelect>
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
