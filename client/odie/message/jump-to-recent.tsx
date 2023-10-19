import { Icon, chevronDown } from '@wordpress/icons';
import classnames from 'classnames';
import React, { useEffect, useState } from 'react';

export const JumpToRecent = ( {
	lastMessageRef,
	inputRef,
}: {
	lastMessageRef: React.RefObject< HTMLDivElement >;
	inputRef: React.RefObject< HTMLDivElement >;
} ) => {
	const [ isLastMessageVisible, setIsLastMessageVisible ] = useState( false );
	const jumpToRecent = () => {
		lastMessageRef?.current?.scrollIntoView( { behavior: 'smooth' } );
	};

	const inputHeight = inputRef?.current?.clientHeight;

	useEffect( () => {
		const handleIntersection = ( entries: IntersectionObserverEntry[] ) => {
			const entry = entries[ 0 ];
			const visibility = entry.intersectionRatio; // percentage of visibility (0, 1)

			setIsLastMessageVisible( visibility > 0 );
		};

		const options = {
			root: lastMessageRef.current?.parentElement,
			threshold: [ 0, 1 ],
		};

		const observer = new IntersectionObserver( handleIntersection, options );

		if ( lastMessageRef.current ) {
			observer.observe( lastMessageRef.current );
		}

		return () => {
			observer.disconnect();
		};
	}, [ lastMessageRef, inputHeight ] );

	const className = classnames( 'odie-gradient-to-white', {
		'is-visible': ! isLastMessageVisible,
		'is-hidden': isLastMessageVisible,
	} );

	return (
		<div className={ className } style={ { bottom: ( inputHeight ?? 0 ) + 2 } }>
			<button className="odie-jump-to-recent-message-button" onClick={ jumpToRecent }>
				Jump to recent
				<Icon icon={ chevronDown } fill="white" />
			</button>
		</div>
	);
};
