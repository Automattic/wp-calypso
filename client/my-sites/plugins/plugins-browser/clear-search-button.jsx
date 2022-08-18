import { useTranslate } from 'i18n-calypso';
import page from 'page';
import { useSelector } from 'react-redux';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import './style.scss';

const ClearSearchButton = () => {
	const siteSlug = useSelector( getSelectedSiteSlug );
	const translate = useTranslate();

	const onClick = () => page.redirect( '/plugins' + ( siteSlug ? '/' + siteSlug : '' ) );

	return (
		<>
			&nbsp;
			<span
				onClick={ () => onClick() }
				onKeyPress={ () => onClick() }
				role="link"
				tabIndex={ 0 }
				className="plugins-browser__clear-search-button"
			>
				{ translate( 'Clear' ) }
			</span>
		</>
	);
};

export default ClearSearchButton;
