import { useRef, useEffect, type FC, type ReactNode } from 'react';

type Props = {
	items: ReactNode[];
};

const JetpackProductInfoRegularList: FC< Props > = ( { items } ) => {
	const listRef = useRef< HTMLUListElement | null >( null );

	const highlightListItem = ( target: HTMLElement ) => {
		target.animate(
			[ { backgroundColor: 'var(--studio-yellow-5)' }, { backgroundColor: 'initial' } ],
			{
				duration: 500,
				easing: 'ease-out',
			}
		);
	};

	// Highlight list item when its content changes
	useEffect( () => {
		if ( ! listRef.current ) {
			return;
		}

		const observer = new MutationObserver( ( record ) => {
			for ( const mutation of record ) {
				if ( mutation.type !== 'characterData' ) {
					continue;
				}

				const targetParent = mutation.target.parentNode as HTMLElement | null;
				if ( targetParent?.className === 'jetpack-product-info__regular-list-item' ) {
					highlightListItem( targetParent );
				}
			}
		} );

		observer.observe( listRef.current as Node, {
			characterData: true,
			subtree: true,
		} );

		return () => observer.disconnect();
	}, [] );

	return (
		<ul className="jetpack-product-info__regular-list" ref={ listRef }>
			{ items.map( ( item, index ) => (
				<li className="jetpack-product-info__regular-list-item" key={ index }>
					{ item }
				</li>
			) ) }
		</ul>
	);
};

export default JetpackProductInfoRegularList;
