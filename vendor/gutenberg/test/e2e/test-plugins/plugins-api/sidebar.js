var Button = wp.components.Button;
var PanelBody = wp.components.PanelBody;
var PanelRow = wp.components.PanelRow;
var withDispatch = wp.data.withDispatch;
var withSelect = wp.data.withSelect;
var PlainText = wp.editor.PlainText;
var Fragment = wp.element.Fragment;
var compose = wp.element.compose;
var el = wp.element.createElement;
var __ = wp.i18n.__;
var registerPlugin = wp.plugins.registerPlugin;
var PluginSidebar = wp.editPost.PluginSidebar;
var PluginSidebarMoreMenuItem = wp.editPost.PluginSidebarMoreMenuItem;

function SidebarContents( props ) {
	return el(
		PanelBody,
		{},
		el(
			PanelRow,
			{},
			el(
				'label',
				{
					'htmlFor': 'title-plain-text'
				},
				__( 'Title:' ),
			),
			el(
				PlainText,
				{
					id: 'title-plain-text',
					onChange: props.updateTitle,
					placeholder: __( '(no title)' ),
					value: props.title
				}
			)
		),
		el(
			PanelRow,
			{},
			el(
				Button,
				{
					isPrimary: true,
					onClick: props.resetTitle
				},
				__( 'Reset' )
			)
		)
	);
}

var SidebarContentsWithDataHandling = compose( [
	withSelect( function( select ) {
		return {
			title: select( 'core/editor' ).getEditedPostAttribute( 'title' ),
		};
	} ),
	withDispatch( function( dispatch ) {
		function editPost( title ) {
			dispatch( 'core/editor' ).editPost( {
				title: title
			} );
		}

		return {
			updateTitle: function( title ) {
				editPost( title );
			},
			resetTitle: function() {
				editPost( '' );
			}
		};
	} )
] )( SidebarContents );

function MySidebarPlugin() {
	return el(
		Fragment,
		{},
		el(
			PluginSidebar,
			{
				name: 'title-sidebar',
				title: __( 'Sidebar title plugin' )
			},
			el(
				SidebarContentsWithDataHandling,
				{}
			)
		),
		el(
			PluginSidebarMoreMenuItem,
			{
				target: 'title-sidebar'
			},
			__( 'Sidebar title plugin' )
		)
	);
}

registerPlugin( 'my-sidebar-plugin', {
	icon: 'text',
	render: MySidebarPlugin
} );
