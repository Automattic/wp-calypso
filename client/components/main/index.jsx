import { ScrollToTopOnMount } from '@automattic/components';
import classNames from 'classnames';

import './style.scss';

export default function Main( {
	className = '',
	id = '',
	children,
	wideLayout = false,
	fullWidthLayout = false,
	isLoggedOut = false,
	scrollToTopOnMount = false,
} ) {
	const classes = classNames( className, 'main', {
		'is-wide-layout': wideLayout,
		'is-full-width-layout': fullWidthLayout,
		'is-logged-out': isLoggedOut,
	} );

	return (
		<main className={ classes } id={ id || null } role="main">
			{ scrollToTopOnMount && <ScrollToTopOnMount /> }
			{ children }
		</main>
	);
}
