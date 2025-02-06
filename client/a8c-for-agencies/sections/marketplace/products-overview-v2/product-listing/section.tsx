import { ReactNode, useEffect, useRef, useState } from 'react';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

type Props = {
	icon?: ReactNode;
	title: string;
	description?: string;
	children: ReactNode;
	extraContent?: ReactNode;
};

export default function ProductListingSection( {
	icon,
	title,
	description,
	children,
	extraContent,
}: Props ) {
	const sectionRef = useRef< HTMLDivElement >( null );
	const [ isVisibleOnce, setIsVisibleOnce ] = useState( false );
	const dispatch = useDispatch();
	useEffect( () => {
		const observer = new IntersectionObserver(
			( [ entry ] ) => {
				if ( ! isVisibleOnce ) {
					setIsVisibleOnce( entry.isIntersecting );
				}
			},
			{
				threshold: 0.1, // Trigger when at least 10% of the element is visible
			}
		);

		if ( sectionRef.current ) {
			observer.observe( sectionRef.current );
		}

		return () => {
			observer.disconnect();
		};
	}, [ isVisibleOnce ] );

	useEffect( () => {
		if ( isVisibleOnce ) {
			dispatch(
				recordTracksEvent( 'calypso_a4a_marketplace_products_overview_section_visible', {
					section: title,
				} )
			);
		}
	}, [ dispatch, isVisibleOnce, title ] );

	return (
		<div className="product-listing-section" ref={ sectionRef }>
			<div className="product-listing-section__header-wrapper">
				<div className="product-listing-section__header">
					{ icon }
					<h2 className="product-listing-section__header-title">{ title }</h2>
					{ description && (
						<span className="product-listing-section__header-subtitle">{ description }</span>
					) }
				</div>
			</div>

			{ extraContent }

			<div className="product-listing-section__content">{ children }</div>
		</div>
	);
}
