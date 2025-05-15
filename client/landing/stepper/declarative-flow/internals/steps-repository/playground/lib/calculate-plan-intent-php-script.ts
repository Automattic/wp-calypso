const php_code = `<?php
require_once( '/wordpress/wp-load.php' );
die( 'plans-playground' ); // short-circuit the logic until we support free/premium plans

$active_plugins = array_diff( get_option( 'active_plugins' ), array( 'hello.php', 'akismet/akismet.php' ) );
if ( in_array( 'woocommerce/woocommerce.php', $active_plugins ) ) {
	echo 'plans-playground';
	return;
}
if ( count( $active_plugins ) > 0 ) {
	echo 'plans-playground';
	return;
}
$has_user_global_styles = count( get_posts( array(
	'post_type' => 'wp_global_styles',
	'post_status' => 'publish',
	'posts_per_page' => 1,
) ) ) > 0;
echo $has_user_global_styles ? 'plans-playground-premium' : 'plans-default-wpcom';`;

export default php_code;
