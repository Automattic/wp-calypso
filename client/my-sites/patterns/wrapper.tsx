import { useLocale, useLocalizeUrl } from '@automattic/i18n-utils';
import { UniversalNavbarFooter, UniversalNavbarHeader } from '@automattic/wpcom-template-parts';
import Main from 'calypso/components/main';
import { useSelector } from 'calypso/state';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';

import './style.scss';

type PatternsWrapperProps = React.PropsWithChildren< unknown >;

export const PatternsWrapper = ( { children }: PatternsWrapperProps ) => {
	const isLoggedIn = useSelector( isUserLoggedIn );
	const localizeUrl = useLocalizeUrl();
	const locale = useLocale();

	return (
		<>
			{ isLoggedIn && (
				<UniversalNavbarHeader
					isLoggedIn
					startUrl={ localizeUrl( '//wordpress.com/setup/assembler-first', locale, isLoggedIn ) }
				/>
			) }

			<Main fullWidthLayout>{ children }</Main>

			{ isLoggedIn && <UniversalNavbarFooter isLoggedIn /> }
		</>
	);
};
