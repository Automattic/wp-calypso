import { useState, useEffect } from 'react';

interface EngagementBarProps {
	className?: string;
}

const EngagementBar = ( { className = '' }: EngagementBarProps ) => {
	const [ isActionsVisible, setIsActionsVisible ] = useState( false );

	useEffect( () => {
		const observer = new IntersectionObserver(
			( entries ) => {
				entries.forEach( ( entry ) => {
					setIsActionsVisible( entry.isIntersecting );
				} );
			},
			{
				threshold: 0.1,
				rootMargin: '0px',
			}
		);

		setTimeout( () => {
			const actionsElement = document.querySelector( '.reader-post-actions' );
			if ( actionsElement ) {
				observer.observe( actionsElement );
			}
		}, 100 );

		return () => {
			const actionsElement = document.querySelector( '.reader-post-actions' );
			if ( actionsElement ) {
				observer.unobserve( actionsElement );
			}
		};
	}, [] );

	return (
		<div
			className={ `recent-feed__post-column-bottom-bar ${
				isActionsVisible ? 'is-actions-visible' : ''
			} ${ className }` }
		>
			<p>Hello world</p>
		</div>
	);
};

export default EngagementBar;
