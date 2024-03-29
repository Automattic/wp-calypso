import styled from '@emotion/styled';
import { useLayoutEffect, useRef, useState } from 'react';
import SitesTableRowLoading from './sites-table-row-loading';
import SitesTableRowNarrow from './sites-table-row-narrow';
import type { SiteExcerptData } from '@automattic/sites';

const N_LOADING_ROWS = 3;

interface SitesTableProps {
	className?: string;
	sites: SiteExcerptData[];
	isLoading?: boolean;
}

const Table = styled.table`
	border-collapse: collapse;
	table-layout: fixed;
	position: relative;
`;

export function SitesTableNarrow( { className, sites, isLoading = false }: SitesTableProps ) {
	const headerRef = useRef< HTMLTableSectionElement >( null );
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [ isHeaderStuck, setIsHeaderStuck ] = useState( false );
	const [ masterbarHeight, setMasterbarHeight ] = useState( 0 );

	// Measure height of masterbar as we need it for the THead styles
	useLayoutEffect( () => {
		const masterbarElement = document.querySelector< HTMLDivElement >( 'header.masterbar' );

		if ( ! masterbarElement ) {
			return;
		}

		if ( ! window.ResizeObserver ) {
			setMasterbarHeight( masterbarElement.offsetHeight );
			return;
		}

		let lastHeight = masterbarElement.offsetHeight;

		const observer = new ResizeObserver(
			( [ masterbar ]: Parameters< ResizeObserverCallback >[ 0 ] ) => {
				const currentHeight = masterbar.contentRect.height;

				if ( currentHeight !== lastHeight ) {
					setMasterbarHeight( currentHeight );
					lastHeight = currentHeight;
				}
			}
		);

		observer.observe( masterbarElement );

		return () => {
			observer.disconnect();
		};
	}, [] );

	// Detect when the header becomes "sticky" so we can show the shadow
	useLayoutEffect( () => {
		if ( ! headerRef.current || ! window.IntersectionObserver ) {
			return;
		}

		const observer = new IntersectionObserver(
			( [ entry ] ) => setIsHeaderStuck( entry.intersectionRatio < 1 ),
			{
				rootMargin: `-${ masterbarHeight + 1 }px 0px 0px 0px`,
				threshold: [ 1 ],
			}
		);

		observer.observe( headerRef.current );

		return () => {
			observer.disconnect();
		};
	}, [ masterbarHeight ] );

	return (
		<Table className={ className }>
			<tbody>
				{ isLoading &&
					Array( N_LOADING_ROWS )
						.fill( null )
						.map( ( _, i ) => (
							<SitesTableRowLoading
								key={ i }
								columns={ 6 }
								delayMS={ i * 150 }
								logoProps={ { width: 108, height: 78 } }
							/>
						) ) }
				{ sites.map( ( site ) => (
					<SitesTableRowNarrow site={ site } key={ site.ID }></SitesTableRowNarrow>
				) ) }
			</tbody>
		</Table>
	);
}
