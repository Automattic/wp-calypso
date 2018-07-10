/**
 * WordPress dependencies
 */
import { IconButton, Panel } from '@wordpress/components';
import { withDispatch, withSelect } from '@wordpress/data';
import { compose, Fragment } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { withPluginContext } from '@wordpress/plugins';

/**
 * Internal dependencies
 */
import PinnedPlugins from '../../header/pinned-plugins';
import Sidebar from '../';
import SidebarHeader from '../sidebar-header';

/**
 * Renders the plugin sidebar component.
 *
 * @param {Object} props Element props.
 *
 * @return {WPElement} Plugin sidebar component.
 */
function PluginSidebar( props ) {
	const {
		children,
		icon,
		isActive,
		isPinnable = true,
		isPinned,
		sidebarName,
		title,
		togglePin,
		toggleSidebar,
	} = props;

	return (
		<Fragment>
			{ isPinnable && (
				<PinnedPlugins>
					{ isPinned && <IconButton
						icon={ icon }
						label={ title }
						onClick={ toggleSidebar }
						isToggled={ isActive }
						aria-expanded={ isActive }
					/> }
				</PinnedPlugins>
			) }
			<Sidebar
				name={ sidebarName }
				label={ __( 'Editor plugins' ) }
			>
				<SidebarHeader
					closeLabel={ __( 'Close plugin' ) }
				>
					<strong>{ title }</strong>
					{ isPinnable && (
						<IconButton
							icon={ isPinned ? 'star-filled' : 'star-empty' }
							label={ isPinned ? __( 'Unpin from toolbar' ) : __( 'Pin to toolbar' ) }
							onClick={ togglePin }
							isToggled={ isPinned }
							aria-expanded={ isPinned }
						/>
					) }
				</SidebarHeader>
				<Panel>
					{ children }
				</Panel>
			</Sidebar>
		</Fragment>
	);
}

export default compose(
	withPluginContext( ( context, ownProps ) => {
		return {
			icon: ownProps.icon || context.icon,
			sidebarName: `${ context.name }/${ ownProps.name }`,
		};
	} ),
	withSelect( ( select, { sidebarName } ) => {
		const {
			getActiveGeneralSidebarName,
			isPluginItemPinned,
		} = select( 'core/edit-post' );

		return {
			isActive: getActiveGeneralSidebarName() === sidebarName,
			isPinned: isPluginItemPinned( sidebarName ),
		};
	} ),
	withDispatch( ( dispatch, { isActive, sidebarName } ) => {
		const {
			closeGeneralSidebar,
			openGeneralSidebar,
			togglePinnedPluginItem,
		} = dispatch( 'core/edit-post' );

		return {
			togglePin() {
				togglePinnedPluginItem( sidebarName );
			},
			toggleSidebar() {
				if ( isActive ) {
					closeGeneralSidebar();
				} else {
					openGeneralSidebar( sidebarName );
				}
			},
		};
	} ),
)( PluginSidebar );
