import clsx from 'clsx';

import './style.scss';

export default function GlobalNoticesContainer( { id, className, children } ) {
	return (
		<div id={ id } className={ clsx( 'global-notices', className ) }>
			{ children }
		</div>
	);
}
