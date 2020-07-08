/**
 * Internal dependencies
 */
import Tab from './tab';
import { __ } from '@wordpress/i18n';
import { dispatch, select } from '@wordpress/data';

/**
 * @typedef { import('./tab').Tab } Tab
 * @typedef {object} Props
 * @property { string } className
 * @property { Tab } selectedTab
 * @property { Tab[] } tabs
 * @property { (tab: Tab) => void } onSelected
 * @property { () => void } selectBlock
 *
 * @param { Props } props
 */
export default function Tabs( props ) {
	const { className, tabs, selectedTab, onSelected, selectBlock } = props;

	/**
	 * If the sidebar is closed, open it and select the premium-content block.
	 */
	const focusBlock = () => {
		if ( ! select( 'core/edit-post' ).isEditorSidebarOpened() ) {
			dispatch( 'core/edit-post' ).openGeneralSidebar( 'edit-post/block' );
		}
		selectBlock();
	};

	return (
		<div className="premium-content-tabs block-editor-block-toolbar">
			{ tabs.map( ( tab ) => (
				<Tab
					key={ tab.id }
					{ ...props }
					tab={ tab }
					selectedTab={ selectedTab }
					className={ `${ className }--tab` }
					label={ tab.label }
					onSelected={ onSelected }
				/>
			) ) }
			<button onClick={ focusBlock } className="edit components-button is-button is-secondary">
				{ __( 'Edit', 'full-site-editing' ) }
			</button>
		</div>
	);
}
