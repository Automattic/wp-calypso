import { Icon, caution, info, published } from '@wordpress/icons';
import type { ReactNode } from 'react';

type Status = 'success' | 'info' | 'error';

const ICONS = { success: published, info, error: caution };

export const StatusNotice = ( { status, children }: { status: Status; children: ReactNode } ) => (
	<div
		className={ `static-site-import__notice is-${ status }` }
		role={ status === 'error' ? 'alert' : 'status' }
	>
		<Icon className="static-site-import__notice-icon" icon={ ICONS[ status ] } size={ 24 } />
		<span>{ children }</span>
	</div>
);
