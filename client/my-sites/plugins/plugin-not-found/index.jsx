import { addLocaleToPathLocaleInFront } from '@automattic/i18n-utils';
import { useTranslate, fixMe } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import EmptyContent from 'calypso/components/empty-content';
import Main from 'calypso/components/main';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';

export default function PluginNotFound() {
	const isLoggedIn = useSelector( isUserLoggedIn );
	const translate = useTranslate();
	const selectedSite = useSelector( getSelectedSite );

	const actionUrl = '/plugins' + ( selectedSite ? '/' + selectedSite.slug : '' );

	return (
		<Main wideLayout>
			<EmptyContent
				title={ fixMe( {
					text: "We can't find this plugin!",
					newCopy: translate( "We can't find this plugin!" ),
					oldCopy: translate( "Oops! We can't find this plugin!" ),
				} ) }
				line={ translate( "The plugin you are looking for doesn't exist." ) }
				action={ translate( 'Browse all plugins' ) }
				actionURL={ isLoggedIn ? actionUrl : addLocaleToPathLocaleInFront( actionUrl ) }
			/>
		</Main>
	);
}
