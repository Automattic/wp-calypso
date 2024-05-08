import clsx from 'clsx';

import './style.scss';

interface MainProps {
	ariaLabel?: string;
	children: React.ReactNode;
	className?: string;
	fullWidthLayout?: boolean;
	id?: string;
	isLoggedOut?: boolean;
	wideLayout?: boolean;
}

export default function Main( {
	className = '',
	id = '',
	children,
	wideLayout = false,
	fullWidthLayout = false,
	isLoggedOut = false,
	ariaLabel,
}: MainProps ) {
	const classes = clsx( className, 'main', {
		'is-wide-layout': wideLayout,
		'is-full-width-layout': fullWidthLayout,
		'is-logged-out': isLoggedOut,
	} );

	return (
		<main className={ classes } id={ id || undefined } role="main" aria-label={ ariaLabel }>
			{ children }
		</main>
	);
}
