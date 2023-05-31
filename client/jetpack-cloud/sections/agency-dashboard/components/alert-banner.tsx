import React, { ReactNode } from 'react';
import './alert-banner.scss';

type AlertBannerProps = {
	type: 'warning' | 'error' | 'success' | 'info';
	children: ReactNode;
};

const AlertBanner: React.FC< AlertBannerProps > = ( { type, children } ) => {
	return <div className={ `alert-banner alert-banner--${ type }` }>{ children }</div>;
};

export default AlertBanner;
