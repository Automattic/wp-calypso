import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import './style.scss';

const ClearSearchButton = () => {
	const siteSlug = useSelector( getSelectedSiteSlug );
	const translate = useTranslate();

	return (
		<>
			&nbsp;
			<a
				className={ 'plugins-browser__clear-filters' }
				href={ '/plugins' + ( siteSlug ? '/' + siteSlug : '' ) }
			>
				{ translate( 'Clear' ) }
			</a>
		</>
	);
};

export default ClearSearchButton;
