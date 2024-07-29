import clsx from 'clsx';
import React, { ReactNode } from 'react';

import './style.scss';

type AlertBannerProps = {
	type: 'warning' | 'error' | 'success' | 'info';
	children: ReactNode;
};

const AlertBanner: React.FC< AlertBannerProps > = ( { type, children } ) => {
	const alertBannerClasses = clsx( 'alert-banner', {
		'alert-banner__warning': type === 'warning',
		'alert-banner__error': type === 'error',
		'alert-banner__success': type === 'success',
		'alert-banner__info': type === 'info',
	} );

	return <div className={ alertBannerClasses }>{ children }</div>;
};

export default AlertBanner;
