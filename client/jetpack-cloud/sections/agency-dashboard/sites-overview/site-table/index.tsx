import { Icon, starFilled, info } from '@wordpress/icons';
import clsx from 'clsx';
import { useContext, useState, forwardRef, Ref } from 'react';
import AddNewSiteTourStep2 from 'calypso/jetpack-cloud/sections/onboarding-tours/add-new-site-tour-step-2';
import TextPlaceholder from 'calypso/jetpack-cloud/sections/partner-portal/text-placeholder';
import './style.scss';
import EditButton from '../../dashboard-bulk-actions/edit-button';
import { useJetpackAgencyDashboardRecordTrackEvent } from '../../hooks';
import SitesOverviewContext from '../context';
import SiteBulkSelect from '../site-bulk-select';
import SiteSort from '../site-sort';
import SiteTableRow from '../site-table-row';
import type { SiteData, SiteColumns } from '../types';

interface Props {
	isLoading: boolean;
	columns: SiteColumns;
	items: Array< SiteData >;
}

const SiteTable = ( { isLoading, columns, items }: Props, ref: Ref< HTMLTableElement > ) => {
	const { isBulkManagementActive, showLicenseInfo } = useContext( SitesOverviewContext );

	const recordEvent = useJetpackAgencyDashboardRecordTrackEvent( null, true );

	const [ expandedRow, setExpandedRow ] = useState< number | null >( null );

	const setExpanded = ( blogId: number ) => {
		recordEvent( 'expandable_block_toggled', {
			expanded: expandedRow !== blogId,
			site_id: blogId,
		} );
		setExpandedRow( expandedRow === blogId ? null : blogId );
	};

	const onShowLicenseInfo = ( license: string ) => {
		recordEvent( 'show_license_info', {
			product: license,
		} );
		showLicenseInfo( license );
	};

	return (
		<>
			<table ref={ ref } className="site-table__table">
				<thead>
					<tr>
						{ isBulkManagementActive ? (
							// Take full-width of the table
							<th colSpan={ 100 }>
								<SiteBulkSelect isLargeScreen sites={ items } isLoading={ isLoading } />
							</th>
						) : (
							<>
								{ columns.map( ( column, index ) => (
									<th key={ column.key }>
										<SiteSort
											isLargeScreen
											isSortable={ column.isSortable }
											columnKey={ column.key }
										>
											{ index === 0 && (
												<Icon
													className="site-table__favorite-icon"
													size={ 24 }
													icon={ starFilled }
												/>
											) }
											<span className={ clsx( index === 0 && 'site-table-site-title' ) }>
												{ column.title }

												{ column.showInfo && (
													<Icon
														className="site-table__tooltip-icon"
														size={ 16 }
														icon={ info }
														onClick={ () => onShowLicenseInfo( column.key ) }
													/>
												) }
											</span>
										</SiteSort>
									</th>
								) ) }
								<th colSpan={ 3 }>
									<div className="plugin-common-table__bulk-actions">
										<EditButton isLargeScreen sites={ items } isLoading={ isLoading } />
									</div>
								</th>
							</>
						) }
					</tr>
				</thead>
				<tbody>
					{ isLoading ? (
						<tr>
							{ columns.map( ( column ) => (
								<td className="site-table__tr-loading" key={ column.key }>
									<TextPlaceholder />
								</td>
							) ) }
							<td>
								<TextPlaceholder />
							</td>
						</tr>
					) : (
						items.map( ( item, index ) => {
							const blogId = item.site.value.blog_id;

							return (
								<SiteTableRow
									index={ index }
									item={ item }
									columns={ columns }
									key={ `table-row-${ blogId }` }
									isExpanded={ expandedRow === blogId }
									setExpanded={ () => setExpanded( blogId ) }
								/>
							);
						} )
					) }
				</tbody>
			</table>
			<AddNewSiteTourStep2 siteItems={ items } />
		</>
	);
};

export default forwardRef( SiteTable );
