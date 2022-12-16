import { Icon, starFilled } from '@wordpress/icons';
import classNames from 'classnames';
import TextPlaceholder from 'calypso/jetpack-cloud/sections/partner-portal/text-placeholder';
import './style.scss';
import SiteTableRow from '../site-table-row';
import type { SiteData, SiteColumns } from '../types';

interface Props {
	isLoading: boolean;
	columns: SiteColumns;
	items: Array< SiteData >;
}

export default function SiteTable( { isLoading, columns, items }: Props ) {
	return (
		<table className="site-table__table">
			<thead>
				<tr>
					{ columns.map( ( column, index ) => (
						<th key={ column.key }>
							{ index === 0 && (
								<Icon className="site-table__favorite-icon" size={ 24 } icon={ starFilled } />
							) }
							<span className={ classNames( index === 0 && 'site-table-site-title' ) }>
								{ column.title }
							</span>
						</th>
					) ) }
					<th></th>
				</tr>
			</thead>
			<tbody>
				{ isLoading ? (
					<tr>
						{ columns.map( ( column ) => (
							<td key={ column.key }>
								<TextPlaceholder />
							</td>
						) ) }
						<td>
							<TextPlaceholder />
						</td>
					</tr>
				) : (
					items.map( ( item ) => {
						const blogId = item.site.value.blog_id;

						return (
							<SiteTableRow item={ item } columns={ columns } key={ `table-row-${ blogId }` } />
						);
					} )
				) }
			</tbody>
		</table>
	);
}
