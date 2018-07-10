var el = wp.element.createElement;
var __ = wp.i18n.__;
var registerPlugin = wp.plugins.registerPlugin;
var PluginPostStatusInfo = wp.editPost.PluginPostStatusInfo;

function MyPostStatusInfoPlugin() {
	return el(
		PluginPostStatusInfo,
		{
			className: 'my-post-status-info-plugin',
		},
		__( 'My post status info' )
	);
}

registerPlugin( 'my-post-status-info-plugin', {
	render: MyPostStatusInfoPlugin
} );
