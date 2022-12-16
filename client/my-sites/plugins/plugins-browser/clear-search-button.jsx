import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import { useLocalizedPlugins } from 'calypso/my-sites/plugins/utils';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import './style.scss';

const ClearSearchButton = () => {
	const siteSlug = useSelector( getSelectedSiteSlug );
	const translate = useTranslate();
	const { localizePath } = useLocalizedPlugins();

	return (
		<>
			&nbsp;
			<a
				className="plugins-browser__clear-filters"
				href={ localizePath( '/plugins' + ( siteSlug ? '/' + siteSlug : '' ) ) }
			>
				{ translate( 'Clear' ) }
			</a>
		</>
	);
};

export default ClearSearchButton;
