import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import { localizePluginsPath } from 'calypso/my-sites/plugins/utils';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import './style.scss';

const ClearSearchButton = () => {
	const siteSlug = useSelector( getSelectedSiteSlug );
	const translate = useTranslate();
	const isLoggedIn = useSelector( isUserLoggedIn );

	return (
		<>
			&nbsp;
			<a
				className={ 'plugins-browser__clear-filters' }
				href={ localizePluginsPath(
					'/plugins' + ( siteSlug ? '/' + siteSlug : '' ),
					translate.localeSlug,
					! isLoggedIn
				) }
			>
				{ translate( 'Clear' ) }
			</a>
		</>
	);
};

export default ClearSearchButton;
