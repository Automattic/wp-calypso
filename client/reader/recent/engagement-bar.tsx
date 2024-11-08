import { useState, useEffect } from 'react';
import ReaderPostActions from 'calypso/blocks/reader-post-actions';
import { useSelector } from 'calypso/state';
import { getPostByKey } from 'calypso/state/reader/posts/selectors';

interface EngagementBarProps {
	className?: string;
	feedId?: string | number;
	postId?: string | number;
}

const EngagementBar = ( { className = '', feedId, postId }: EngagementBarProps ) => {
	const post = useSelector( ( state ) =>
		feedId && postId ? getPostByKey( state, { feedId, postId } ) : null
	);

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
			const actionsElement = document.querySelector( '.reader-full-post .reader-post-actions' );

			if ( actionsElement ) {
				observer.observe( actionsElement );
			}
		}, 100 );

		return () => {
			const actionsElement = document.querySelector( '.reader-full-post .reader-post-actions' );
			if ( actionsElement ) {
				observer.unobserve( actionsElement );
			}
		};
	}, [ post ] );

	return (
		<div
			className={ `recent-feed__post-column-bottom-bar ${
				isActionsVisible ? 'is-actions-visible' : ''
			} ${ className }` }
		>
			{ post && <ReaderPostActions className="engagement-bar__actions" post={ post } /> }
		</div>
	);
};

export default EngagementBar;
