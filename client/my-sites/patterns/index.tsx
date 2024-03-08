import { UniversalNavbarHeader } from '@automattic/wpcom-template-parts';
import Main from 'calypso/components/main';
import { PatternsCategoryPage } from 'calypso/my-sites/patterns/pages/category';
import { PatternsHomePage } from 'calypso/my-sites/patterns/pages/home';
import { useSelector } from 'calypso/state';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import type { PatternGalleryFC } from 'calypso/my-sites/patterns/types';

import './style.scss';

type PatternsIndexProps = {
	category: string;
	isGridView?: boolean;
	patternGallery: PatternGalleryFC;
};

export const PatternsIndex = ( {
	category,
	isGridView,
	patternGallery: PatternGallery,
}: PatternsIndexProps ) => {
	const isLoggedIn = useSelector( isUserLoggedIn );

	return (
		<>
			{ isLoggedIn && <UniversalNavbarHeader isLoggedIn /> }

			<Main isLoggedOut fullWidthLayout>
				{ ! category ? (
					<PatternsHomePage />
				) : (
					<PatternsCategoryPage
						category={ category }
						isGridView={ isGridView }
						patternGallery={ PatternGallery }
					/>
				) }
			</Main>
		</>
	);
};
