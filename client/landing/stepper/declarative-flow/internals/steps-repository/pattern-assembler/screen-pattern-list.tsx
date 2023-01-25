import { Button } from '@automattic/components';
import { __experimentalNavigatorBackButton as NavigatorBackButton } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import { useSite } from '../../../../hooks/use-site';
import usePatternCategoriesFromAPI from './hooks/use-pattern-categories-from-api';
import NavigatorHeader from './navigator-header';
import PatternSelector from './pattern-selector';
import type { Pattern, Category } from './types';

interface Props {
	patterns: Pattern[];
	selectedPattern: Pattern | null;
	onSelect: ( selectedPattern: Pattern ) => void;
	onDoneClick: () => void;
}

const useSectionPatternsMapByCategory = ( patterns: Pattern[], categories: Category[] ) => {
	return categories.reduce( ( categoriesMap: { [ key: string ]: Pattern[] }, category ) => {
		patterns.forEach( ( pattern ) => {
			if ( pattern?.categories?.includes( category.name ) ) {
				const patternsInCategory = categoriesMap[ category.name ] || [];
				patternsInCategory.push( pattern );
				categoriesMap[ category.name ] = patternsInCategory;
			}
		} );
		return categoriesMap;
	}, {} );
};

const ScreenPatternList = ( { patterns, selectedPattern, onSelect, onDoneClick }: Props ) => {
	const translate = useTranslate();
	const site = useSite();
	const categoriesQuery = usePatternCategoriesFromAPI( site?.ID );
	const categories = ( categoriesQuery?.data as [] ) || [];
	const [ categorySelected, setCategory ] = useState< string | null >( null );
	const sectionPatternsMapByCategory = useSectionPatternsMapByCategory( patterns, categories );

	return (
		<>
			<NavigatorHeader
				title={ translate( 'Add patterns' ) }
				description={
					categorySelected
						? ''
						: translate(
								'Find the right patterns for you by exploring the list of categories below.'
						  )
				}
			/>
			<div className="screen-container__body">
				{ ! categorySelected &&
					categories
						.filter( ( { name } ) => sectionPatternsMapByCategory[ name ]?.length )
						.map( ( { name, label, description } ) => {
							return (
								<Button
									key={ name }
									className="screen-pattern-list__category-button"
									title={ description }
									onClick={ () => setCategory( name ) }
								>
									{ label } ({ sectionPatternsMapByCategory[ name ]?.length || 0 })
								</Button>
							);
						} ) }
				{ categorySelected && (
					<PatternSelector
						patterns={ sectionPatternsMapByCategory[ categorySelected ] }
						onSelect={ onSelect }
						selectedPattern={ selectedPattern }
						hideDone={ true }
					/>
				) }
			</div>
			<div className="screen-pattern-list__footer">
				<NavigatorBackButton
					as={ Button }
					className="pattern-assembler__button"
					onClick={ onDoneClick }
					primary
				>
					{ translate( 'Done' ) }
				</NavigatorBackButton>
			</div>
		</>
	);
};

export default ScreenPatternList;
