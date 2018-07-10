var el = wp.element.createElement;
var Fragment = wp.element.Fragment;
var __ = wp.i18n.__;
var registerPlugin = wp.plugins.registerPlugin;
var PluginPostPublishPanel = wp.editPost.PluginPostPublishPanel;
var PluginPrePublishPanel = wp.editPost.PluginPrePublishPanel;

function PanelContent() {
	return el(
		'p',
		{},
		__( 'Here is the panel content!' )
	);
}

function MyPublishPanelPlugin() {
	return el(
		Fragment,
		{},
		el(
			PluginPrePublishPanel,
			{
				className: 'my-publish-panel-plugin__pre',
				title: __( 'My pre publish panel' )
			},
			el(
				PanelContent,
				{}
			)
		),
		el(
			PluginPostPublishPanel,
			{
				className: 'my-publish-panel-plugin__post',
				title: __( 'My post publish panel' )
			},
			el(
				PanelContent,
				{}
			)
		)
	);
}

registerPlugin( 'my-publish-panel-plugin', {
	render: MyPublishPanelPlugin
} );
