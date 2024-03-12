import { UniversalNavbarFooter, UniversalNavbarHeader } from '@automattic/wpcom-template-parts';
import Main from 'calypso/components/main';
import { PatternsCategoryPage } from 'calypso/my-sites/patterns/pages/category';
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
	patternTypeFilter: PatternTypeFilter;
};

export const PatternsWrapper = ( {
	category,
	categoryGallery,
	isGridView,
	patternGallery,
	patternTypeFilter,
}: PatternsWrapperProps ) => {
	const isLoggedIn = useSelector( isUserLoggedIn );

	return (
		<>
			{ isLoggedIn && <UniversalNavbarHeader isLoggedIn /> }

			<Main isLoggedOut fullWidthLayout>
				<PatternsCategoryPage
					category={ category }
					categoryGallery={ categoryGallery }
					isGridView={ isGridView }
					patternGallery={ patternGallery }
					patternTypeFilter={ patternTypeFilter }
				/>
			</Main>

			{ isLoggedIn && <UniversalNavbarFooter isLoggedIn /> }
		</>
	);
};
