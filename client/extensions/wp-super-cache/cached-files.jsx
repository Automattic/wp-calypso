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
		<FoldableCard compact
			className="wp-super-cache__foldable-card"
			header={ header }>
			<ul className="wp-super-cache__contents-list wp-super-cache__contents-list-legend">
				<li className="wp-super-cache__contents-list-item">
					<span className="wp-super-cache__contents-list-item-right">
						<span className="wp-super-cache__contents-list-item-value">
							{ translate( 'Age' ) }
						</span>
						<span className="wp-super-cache__contents-list-item-action"></span>
					</span>
					<span className="wp-super-cache__contents-list-item-label">
						{ translate( 'URI' ) }
					</span>
				</li>
			</ul>

			<ul className="wp-super-cache__contents-list">
			{ files && files.map( ( file ) =>
				<li className="wp-super-cache__contents-list-item" key={ file.uri }>
					<span className="wp-super-cache__contents-list-item-right">
						<span className="wp-super-cache__contents-list-item-value">
							{ file.age }
						</span>
						<span className="wp-super-cache__contents-list-item-action">
							<Button compact>
								{ translate( 'Delete' ) }
							</Button>
						</span>
					</span>
					<span className="wp-super-cache__contents-list-item-label">
						<a href={ `http://${ file.uri }` }>
							{ file.uri }
						</a>
					</span>
				</li>
			) }
			</ul>
		</FoldableCard>
	);
};

export default localize( CachedFiles );
