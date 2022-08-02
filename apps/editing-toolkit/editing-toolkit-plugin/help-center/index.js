import './src/config';
import { HelpCenter } from '@automattic/data-stores';
import './src/help-center';
import './src/help-center.scss';

if (
	window.location.pathname.startsWith( '/wp-admin/' ) &&
	! [ '/wp-admin/site-editor.php', '/wp-admin/post.php', '/wp-admin/post-new.php' ].includes(
		window.location.pathname
	)
) {
	import( './src/admin-bar' );
}

HelpCenter.register();
