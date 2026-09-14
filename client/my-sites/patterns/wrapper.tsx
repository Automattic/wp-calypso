import { useLocale } from '@automattic/i18n-utils';
import { UniversalNavbarFooter } from '@automattic/wpcom-template-parts';
import Main from 'calypso/components/main';
import { Nav2026UniversalHeader } from 'calypso/layout/nav-2026-universal-header';
import { getOnboardingUrl } from 'calypso/my-sites/patterns/paths';
import { useSelector } from 'calypso/state';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';

import './style.scss';

type PatternsWrapperProps = React.PropsWithChildren< { hideGetStartedCta?: boolean } >;

export const PatternsWrapper = ( {
	hideGetStartedCta = false,
	children,
}: PatternsWrapperProps ) => {
	const isLoggedIn = useSelector( isUserLoggedIn );
	const locale = useLocale();

	return (
		<>
			{ isLoggedIn && (
				<Nav2026UniversalHeader
					hideGetStartedCta={ hideGetStartedCta }
					isLoggedIn
					startUrl={ getOnboardingUrl( locale, isLoggedIn ) }
				/>
			) }

			<Main fullWidthLayout>{ children }</Main>

			{ isLoggedIn && <UniversalNavbarFooter isLoggedIn /> }
		</>
	);
};
