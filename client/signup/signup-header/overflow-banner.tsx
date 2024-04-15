import { useEffect, useState } from '@wordpress/element';
import classnames from 'classnames';
import { ReactNode } from 'react';

export const SignupHeaderBanner = ( {
	children,
}: {
	stickyBannerOffset?: number;
	height?: number;
	children: ReactNode;
} ) => {
	const [ isAboveOffset, setIsAboveOffset ] = useState( false );

	useEffect( () => {
		const handleScroll = () => {
			const scrollY = window.scrollY;
			if ( scrollY > 40 ) {
				setIsAboveOffset( true );
			} else {
				setIsAboveOffset( false );
			}
		};

		window.addEventListener( 'scroll', handleScroll );

		return () => {
			window.removeEventListener( 'scroll', handleScroll );
		};
	}, [] );

	const classes = classnames( 'signup-header__overlfow-banner', {
		'is-sticky-banner': isAboveOffset,
		'is-header-banner': ! isAboveOffset,
	} );

	return <div className={ classes }>{ children }</div>;
};
