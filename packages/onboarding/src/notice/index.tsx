import { Icon, info } from '@wordpress/icons';
import clsx from 'clsx';
import * as React from 'react';

import './style.scss';

const Notice: React.FunctionComponent< { children: React.ReactNode } > = ( { children } ) => {
	return (
		<div className={ clsx( 'onboarding-notice' ) }>
			<Icon icon={ info } size={ 28 } />
			<p>{ children }</p>
		</div>
	);
};

export default Notice;
