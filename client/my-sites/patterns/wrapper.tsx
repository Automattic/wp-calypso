import { isEnabled } from '@automattic/calypso-config';
import { useLocale } from '@automattic/i18n-utils';
import { getFooter2026Colorway, UniversalNavbarFooter } from '@automattic/wpcom-template-parts';
import Main from 'calypso/components/main';
import { Nav2026UniversalHeader } from 'calypso/layout/nav-2026-universal-header';
import { getOnboardingUrl } from 'calypso/my-sites/patterns/paths';
import { useSelector } from 'calypso/state';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import getCurrentQueryArguments from 'calypso/state/selectors/get-current-query-arguments';

import './style.scss';

type PatternsWrapperProps = React.PropsWithChildren< { hideGetStartedCta?: boolean } >;

export const PatternsWrapper = ( {
	hideGetStartedCta = false,
	children,
}: PatternsWrapperProps ) => {
	const isLoggedIn = useSelector( isUserLoggedIn );
	const locale = useLocale();
	const currentQuery = useSelector( getCurrentQueryArguments );
	const footerColorway = getFooter2026Colorway(
		isEnabled( 'footer-redesign/2026' ),
		currentQuery?.footer_2026
	);

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

			{ isLoggedIn && <UniversalNavbarFooter isLoggedIn colorway={ footerColorway } /> }
		</>
	);
};
