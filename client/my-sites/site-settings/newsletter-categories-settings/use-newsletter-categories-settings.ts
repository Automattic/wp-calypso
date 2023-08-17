import { useTranslate } from 'i18n-calypso';
import { useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import {
	useMarkAsNewsletterCategoryMutation,
	useNewsletterCategoriesQuery,
	useUnmarkAsNewsletterCategoryMutation,
} from 'calypso/data/newsletter-categories';
import { NewsletterCategory } from 'calypso/data/newsletter-categories/types';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';

type Category = {
	ID: number;
	description: string;
	feed_url: string;
	name: string;
	parent: number;
	post_count: number;
	slug: string;
};

const convertToNewsletterCategory = ( category: Category ): NewsletterCategory => ( {
	id: category.ID,
	name: category.name,
	slug: category.slug,
	description: category.description,
	parent: category.parent,
} );

const useNewsletterCategoriesSettings = ( siteId: number ) => {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const { data: initialData, isLoading } = useNewsletterCategoriesQuery( { siteId } );
	const [ newsletterCategories, setNewsletterCategories ] = useState(
		initialData?.newsletterCategories ?? []
	);
	const newsletterCategoryIds = useMemo(
		() => newsletterCategories.map( ( { id } ) => id ),
		[ newsletterCategories ]
	);
	const { mutateAsync: markNewsletterCategory, isLoading: isMarking } =
		useMarkAsNewsletterCategoryMutation( siteId );
	const { mutateAsync: unmarkNewsletterCategory, isLoading: isUnmarking } =
		useUnmarkAsNewsletterCategoryMutation( siteId );

	const handleCategoryToggle = ( category: Category ) => {
		const index = newsletterCategories.findIndex( ( { id } ) => id === category.ID );
		const newNewsletterCategories = [ ...newsletterCategories ];

		if ( index === -1 ) {
			newNewsletterCategories.push( convertToNewsletterCategory( category ) );
		} else {
			newNewsletterCategories.splice( index, 1 );
		}

		setNewsletterCategories( newNewsletterCategories );
	};

	const handleSave = () => {
		const categoriesToMark =
			newsletterCategories.filter(
				( category ) =>
					! initialData?.newsletterCategories?.some( ( { id } ) => id === category.id )
			) ?? [];

		const categoriesToUnmark =
			initialData?.newsletterCategories?.filter(
				( category ) => ! newsletterCategories.some( ( { id } ) => id === category.id )
			) ?? [];

		const promises = [] as Promise< unknown >[];

		categoriesToMark.forEach( ( category ) => {
			promises.push( markNewsletterCategory( category.id ) );
		} );

		categoriesToUnmark.forEach( ( category ) => {
			promises.push( unmarkNewsletterCategory( category.id ) );
		} );

		Promise.all( promises )
			.then( () => {
				dispatch( successNotice( translate( 'Your newsletter categories have been saved.' ) ) );
			} )
			.catch( () => {
				dispatch(
					errorNotice(
						translate( 'There was an error when trying to save your newsletter categories.' )
					)
				);
			} );
	};

	return {
		isLoading,
		isSaving: isMarking || isUnmarking,
		newsletterCategories,
		newsletterCategoryIds,
		handleCategoryToggle,
		handleSave,
	};
};

export default useNewsletterCategoriesSettings;
