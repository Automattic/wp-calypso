/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import FoldableCard from 'components/foldable-card';

const CachedFiles = ( {
	files,
	header,
	translate,
} ) => {
	return (
		<FoldableCard
			compact
			className="wp-super-cache__foldable-card"
			header={ header }>
			<table className="wp-super-cache__stats">
				<thead>
					<tr className="wp-super-cache__stats-header-row">
						<th className="wp-super-cache__stats-header-column">{ translate( 'URI' ) }</th>
						<th className="wp-super-cache__stats-header-column">{ translate( 'Files' ) }</th>
						<th className="wp-super-cache__stats-header-column">{ translate( 'Age' ) }</th>
						<th className="wp-super-cache__stats-header-column"></th>
					</tr>
				</thead>
				<tbody>
					{ files && files.map( ( file, index ) =>
					<tr className="wp-super-cache__stat" key={ index }>
						<td className="wp-super-cache__stat-dir">{ file.dir }</td>
						<td>{ file.files }</td>
						<td className="wp-super-cache__stat-age">{ `${ file.lower_age } - ${ file.upper_age }` }</td>
						<td className="wp-super-cache__stat-action">
							<Button compact>
								{ translate( 'Delete' ) }
							</Button>
						</td>
					</tr>
				) }
				</tbody>
			</table>
		</FoldableCard>
	);
};

export default localize( CachedFiles );
