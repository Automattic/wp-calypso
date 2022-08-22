import styled from '@emotion/styled';
import { useI18n } from '@wordpress/react-i18n';
import { useLayoutEffect, useState } from 'react';
import { MEDIA_QUERIES } from '../utils';
import SitesTableRow from './sites-table-row';
import SitesTableRowLoading from './sites-table-row-loading';
import type { SiteExcerptData } from 'calypso/data/sites/site-excerpt-types';

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

const THead = styled.thead< { top: number } >( ( { top } ) => ( {
	[ MEDIA_QUERIES.mediumOrSmaller ]: {
		display: 'none',
	},

	position: 'sticky',
	zIndex: 3,
	top: `${ top }px`,

	background: '#fdfdfd',
} ) );

const Row = styled.tr`
	line-height: 2em;
	border-bottom: 1px solid #eee;

	th {
		padding-top: 12px;
		padding-bottom: 12px;
		vertical-align: middle;
		font-size: 14px;
		line-height: 20px;
		letter-spacing: -0.24px;
		font-weight: 500;
		color: var( --studio-gray-60 );
	}
`;

export function SitesTable( { className, sites, isLoading = false }: SitesTableProps ) {
	const { __ } = useI18n();

	const [ masterbarHeight, setMasterbarHeight ] = useState( 0 );

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

	return (
		<Table className={ className }>
			<THead top={ masterbarHeight }>
				<Row>
					<th style={ { width: '50%' } }>{ __( 'Site' ) }</th>
					<th style={ { width: '20%' } }>{ __( 'Plan' ) }</th>
					<th>{ __( 'Last Publish' ) }</th>
					<th>{ __( 'Status' ) }</th>
					<th style={ { width: '24px' } }></th>
				</Row>
			</THead>
			<tbody>
				{ isLoading &&
					Array( N_LOADING_ROWS )
						.fill( null )
						.map( ( _, i ) => (
							<SitesTableRowLoading
								key={ i }
								columns={ 5 }
								delayMS={ i * 150 }
								logoProps={ { width: 108, height: 78 } }
							/>
						) ) }
				{ sites.map( ( site ) => (
					<SitesTableRow site={ site } key={ site.ID }></SitesTableRow>
				) ) }
			</tbody>
		</Table>
	);
}
