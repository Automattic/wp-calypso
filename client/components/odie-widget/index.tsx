import { useLocale } from '@automattic/i18n-utils';
import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { showOdie } from 'calypso/lib/odie';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

const OdieWidget = () => {
	const widgetContainer = useRef< HTMLDivElement >( null );
	const localeSlug = useLocale();
	const siteId = useSelector( getSelectedSiteId );

	useEffect( () => {
		( async () => {
			await showOdie( siteId, widgetContainer.current, localeSlug );
		} )();
	}, [ siteId, localeSlug ] );

	return <div className="odie-widget__widget-container" ref={ widgetContainer }></div>;
};

export default OdieWidget;
