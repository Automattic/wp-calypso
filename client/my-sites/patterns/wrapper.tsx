import { UniversalNavbarFooter, UniversalNavbarHeader } from '@automattic/wpcom-template-parts';
import Main from 'calypso/components/main';
import { PatternsCategoryNotFound } from 'calypso/my-sites/patterns/components/category-not-found';
import { CATEGORY_NOT_FOUND } from 'calypso/my-sites/patterns/constants';
import { useSelector } from 'calypso/state';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';

import './style.scss';

type PatternsWrapperProps = React.PropsWithChildren< {
	category: string;
} >;

export const PatternsWrapper = ( { category, children }: PatternsWrapperProps ) => {
	const isLoggedIn = useSelector( isUserLoggedIn );
	const isCategoryNotFound = category === CATEGORY_NOT_FOUND;

	return (
		<>
			{ isLoggedIn && <UniversalNavbarHeader isLoggedIn /> }

			<Main isLoggedOut fullWidthLayout>
				{ isCategoryNotFound ? <PatternsCategoryNotFound /> : children }
			</Main>

			{ isLoggedIn && <UniversalNavbarFooter isLoggedIn /> }
		</>
	);
};
