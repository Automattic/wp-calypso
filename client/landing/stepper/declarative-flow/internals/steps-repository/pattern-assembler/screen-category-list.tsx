import { Button } from '@automattic/components';
import { __experimentalNavigatorBackButton as NavigatorBackButton } from '@wordpress/components';
import { Icon, chevronRight } from '@wordpress/icons';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import useCategoriesOrder from './hooks/use-categories-order';
import NavigatorHeader from './navigator-header';
import type { Pattern, Category } from './types';
import './screen-category-list.scss';

interface Props {
	categories: Category[];
	categorySelected: string | null;
	sectionsMapByCategory: { [ key: string ]: Pattern[] };
	setCategory: ( name: string | null ) => void;
	onDoneClick: () => void;
	setOpenPatternList: ( open: boolean ) => void;
	replacePatternMode: boolean;
}

const ScreenCategoryList = ( {
	sectionsMapByCategory,
	categories,
	setCategory,
	categorySelected,
	onDoneClick,
	setOpenPatternList,
	replacePatternMode,
}: Props ) => {
	const translate = useTranslate();
	const categoriesInOrder = useCategoriesOrder( categories );
	const categoriesWithPatterns = useMemo( () => {
		// Render only categories with patterns
		return categoriesInOrder.filter( ( { name } ) => sectionsMapByCategory[ name ]?.length );
	}, [ categoriesInOrder, sectionsMapByCategory ] );

	return (
		<>
			<NavigatorHeader
				title={ replacePatternMode ? translate( 'Replace pattern' ) : translate( 'Add patterns' ) }
				description={
					replacePatternMode
						? translate(
								'Replace the selected pattern by choosing from the list of categories below.'
						  )
						: translate(
								'Find the right patterns for you by exploring the list of categories below.'
						  )
				}
			/>
			<div className="screen-container__body screen-category-list__body">
				{ categoriesWithPatterns.map( ( { name, label, description } ) => {
					const isOpen = categorySelected === name;
					return (
						<Button
							key={ name }
							className={ classNames( 'screen-category-list__category-button', {
								'--is-open': isOpen,
							} ) }
							title={ description }
							onClick={ () => {
								if ( isOpen ) {
									setOpenPatternList( false );
									setCategory( null );
								} else {
									setCategory( name );
									setOpenPatternList( true );
								}
							} }
						>
							<span>{ label }</span>
							<Icon icon={ chevronRight } size={ 22 } />
						</Button>
					);
				} ) }
			</div>
			<div className="screen-container__footer">
				<NavigatorBackButton
					as={ Button }
					className="pattern-assembler__button"
					onClick={ () => {
						onDoneClick();
						setOpenPatternList( false );
						setCategory( null );
					} }
					primary
				>
					{ translate( 'Done' ) }
				</NavigatorBackButton>
			</div>
		</>
	);
};

export default ScreenCategoryList;
