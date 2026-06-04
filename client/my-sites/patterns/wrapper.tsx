import config from '@automattic/calypso-config';
import { useLocale } from '@automattic/i18n-utils';
import { UniversalNavbarFooter, UniversalNavbarHeader } from '@automattic/wpcom-template-parts';
import Main from 'calypso/components/main';
import { getOnboardingUrl } from 'calypso/my-sites/patterns/paths';
import { useSelector } from 'calypso/state';
import {
	getCurrentUser,
	getCurrentUserDisplayName,
	getCurrentUserEmail,
	isUserLoggedIn,
} from 'calypso/state/current-user/selectors';

import './style.scss';

type PatternsWrapperProps = React.PropsWithChildren< { hideGetStartedCta?: boolean } >;

export const PatternsWrapper = ( {
	hideGetStartedCta = false,
	children,
}: PatternsWrapperProps ) => {
	const isLoggedIn = useSelector( isUserLoggedIn );
	const locale = useLocale();
	const nav2026 = config.isEnabled( 'nav-redesign/2026' );
	const nav2026Variant = config.isEnabled( 'nav-redesign/2026-variant-2' ) ? 2 : 1;
	const userAvatar = useSelector( ( state ) => getCurrentUser( state )?.avatar_URL );
	const userName = useSelector( getCurrentUserDisplayName );
	const userEmail = useSelector( getCurrentUserEmail );

	return (
		<>
			{ isLoggedIn && (
				<UniversalNavbarHeader
					hideGetStartedCta={ hideGetStartedCta }
					isLoggedIn
					startUrl={ getOnboardingUrl( locale, isLoggedIn ) }
					{ ...( nav2026 && {
						nav2026: true,
						nav2026Variant,
						userAvatar,
						userName,
						userEmail,
					} ) }
				/>
			) }

			<Main fullWidthLayout>{ children }</Main>

			{ isLoggedIn && <UniversalNavbarFooter isLoggedIn /> }
		</>
	);
};
