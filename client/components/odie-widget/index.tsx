import { useLocale } from '@automattic/i18n-utils';
import { useEffect, useRef } from 'react';
import { showOdie } from 'calypso/lib/odie';

const OdieWidget = () => {
	const widgetContainer = useRef< HTMLDivElement >( null );
	const localeSlug = useLocale();

	useEffect( () => {
		( async () => {
			await showOdie( widgetContainer.current, localeSlug );
		} )();
	}, [ localeSlug ] );

	return <div className="odie-widget__widget-container" ref={ widgetContainer }></div>;
};

export default OdieWidget;
