/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import BlockTitle from '../block-title';

const TableOfContentsItem = ( {
	children,
	isValid,
	level,
	onClick,
	path = [],
} ) => (
	<li
		className={ classnames(
			'document-outline__item',
			`is-${ level.toLowerCase() }`,
			{
				'is-invalid': ! isValid,
			}
		) }
	>
		<button
			className="document-outline__button"
			onClick={ onClick }
		>
			<span className="document-outline__emdash" aria-hidden="true"></span>
			{
				// path is an array of nodes that are ancestors of the heading starting in the top level node.
				// This mapping renders each ancestor to make it easier for the user to know where the headings are nested.
				path.map( ( { uid }, index ) => (
					<strong key={ index } className="document-outline__level">
						<BlockTitle uid={ uid } />
					</strong>
				) )
			}
			<strong className="document-outline__level">
				{ level }
			</strong>
			<span className="document-outline__item-content">
				{ children }
			</span>
			<span className="screen-reader-text">{ __( '(Click to focus this heading)' ) }</span>
		</button>
	</li>
);

export default TableOfContentsItem;
