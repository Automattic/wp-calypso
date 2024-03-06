import page from '@automattic/calypso-router';
import { removeLocaleFromPathLocaleInFront } from '@automattic/i18n-utils';
import { UniversalNavbarFooter, UniversalNavbarHeader } from '@automattic/wpcom-template-parts';
import { ChangeEvent } from 'react';
import Main from 'calypso/components/main';
import { PatternsCategoryPage } from 'calypso/my-sites/patterns/pages/category';
import { PatternsHomePage } from 'calypso/my-sites/patterns/pages/home';
import { useSelector } from 'calypso/state';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { getCurrentRoute } from 'calypso/state/selectors/get-current-route';
import type { PatternGalleryFC } from 'calypso/my-sites/patterns/types';

import './style.scss';

type PatternsWrapperProps = {
	category: string;
	isGridView?: boolean;
	patternGallery: PatternGalleryFC;
};

export const PatternsWrapper = ( {
	category,
	isGridView,
	patternGallery: PatternGallery,
}: PatternsWrapperProps ) => {
	const isLoggedIn = useSelector( isUserLoggedIn );
	const currentRoute = useSelector( getCurrentRoute );

	const pathNameWithoutLocale = currentRoute && removeLocaleFromPathLocaleInFront( currentRoute );

	const onLanguageChange = ( event: ChangeEvent< HTMLSelectElement > ) => {
		page( `/${ event.target.value + pathNameWithoutLocale }` );

		window.location.reload();
	};

	return (
		<>
			{ isLoggedIn && <UniversalNavbarHeader isLoggedIn /> }

			<Main isLoggedOut fullWidthLayout>
				{ ! category ? (
					<PatternsHomePage isGridView={ isGridView } patternGallery={ PatternGallery } />
				) : (
					<PatternsCategoryPage
						category={ category }
						isGridView={ isGridView }
						patternGallery={ PatternGallery }
					/>
				) }
			</Main>

			{ isLoggedIn && <UniversalNavbarFooter isLoggedIn onLanguageChange={ onLanguageChange } /> }
		</>
	);
};
