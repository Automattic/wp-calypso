import { UniversalNavbarFooter, UniversalNavbarHeader } from '@automattic/wpcom-template-parts';
import Main from 'calypso/components/main';
import { PatternsCategoryPage } from 'calypso/my-sites/patterns/pages/category';
import { PatternsHomePage } from 'calypso/my-sites/patterns/pages/home';
import {
	type CategoryGalleryFC,
	type PatternGalleryFC,
	PatternTypeFilter,
} from 'calypso/my-sites/patterns/types';
import { useSelector } from 'calypso/state';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';

import './style.scss';

type PatternsWrapperProps = {
	category: string;
	categoryGallery: CategoryGalleryFC;
	isGridView?: boolean;
	patternGallery: PatternGalleryFC;
	patternType: PatternTypeFilter;
};

export const PatternsWrapper = ( {
	category,
	categoryGallery,
	isGridView,
	patternGallery,
	patternType,
}: PatternsWrapperProps ) => {
	const isLoggedIn = useSelector( isUserLoggedIn );

	return (
		<>
			{ isLoggedIn && <UniversalNavbarHeader isLoggedIn /> }

			<Main isLoggedOut fullWidthLayout>
				{ ! category ? (
					<PatternsHomePage
						categoryGallery={ categoryGallery }
						isGridView={ isGridView }
						patternGallery={ patternGallery }
					/>
				) : (
					<PatternsCategoryPage
						category={ category }
						isGridView={ isGridView }
						patternGallery={ patternGallery }
						patternType={ patternType }
					/>
				) }
			</Main>

			{ isLoggedIn && <UniversalNavbarFooter isLoggedIn /> }
		</>
	);
};
