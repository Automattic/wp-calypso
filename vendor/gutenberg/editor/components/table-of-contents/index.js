/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { Dropdown, IconButton } from '@wordpress/components';
import { withSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import './style.scss';
import TableOfContentsPanel from './panel';

function TableOfContents( { hasBlocks } ) {
	return (
		<Dropdown
			position="bottom"
			className="table-of-contents"
			contentClassName="table-of-contents__popover"
			renderToggle={ ( { isOpen, onToggle } ) => (
				<IconButton
					onClick={ onToggle }
					icon="info-outline"
					aria-expanded={ isOpen }
					label={ __( 'Content Structure' ) }
					disabled={ ! hasBlocks }
				/>
			) }
			renderContent={ () => <TableOfContentsPanel /> }
		/>
	);
}

export default withSelect( ( select ) => {
	return {
		hasBlocks: !! select( 'core/editor' ).getBlockCount(),
	};
} )( TableOfContents );
