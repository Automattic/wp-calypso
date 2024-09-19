import { addLocaleToPathLocaleInFront } from '@automattic/i18n-utils';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import EmptyContent from 'calypso/components/empty-content';
import Main from 'calypso/components/main';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';

export default function ThemeNotFoundError() {
	const isLoggedIn = useSelector( isUserLoggedIn );
	const translate = useTranslate();

	const title = translate( 'Looking for great WordPress designs?', {
		comment: 'Message displayed when requested theme was not found',
	} );

	const line = translate( 'Check our theme showcase', {
		comment: 'Message displayed when requested theme was not found',
	} );

	return (
		<Main wideLayout>
			<EmptyContent
				title={ title }
				line={ line }
				action={ translate( 'View the showcase' ) }
				actionURL={ isLoggedIn ? '/themes' : addLocaleToPathLocaleInFront( '/themes' ) }
			/>
		</Main>
	);
}
