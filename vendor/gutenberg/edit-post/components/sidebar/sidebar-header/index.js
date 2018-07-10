/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { Fragment, compose } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { IconButton } from '@wordpress/components';
import { withDispatch, withSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import './style.scss';

const SidebarHeader = ( { children, className, closeLabel, closeSidebar, title } ) => {
	return (
		<Fragment>
			<div className="components-panel__header edit-post-sidebar-header__small">
				<span className="edit-post-sidebar-header__title">
					{ title || __( '(no title)' ) }
				</span>
				<IconButton
					onClick={ closeSidebar }
					icon="no-alt"
					label={ closeLabel }
				/>
			</div>
			<div className={ classnames( 'components-panel__header edit-post-sidebar-header', className ) }>
				{ children }
				<IconButton
					onClick={ closeSidebar }
					icon="no-alt"
					label={ closeLabel }
				/>
			</div>
		</Fragment>
	);
};

export default compose(
	withSelect( ( select ) => ( {
		title: select( 'core/editor' ).getEditedPostAttribute( 'title' ),
	} ) ),
	withDispatch( ( dispatch ) => ( {
		closeSidebar: dispatch( 'core/edit-post' ).closeGeneralSidebar,
	} ) ),
)( SidebarHeader );
