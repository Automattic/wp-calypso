<?php
/**
 * Title: Search card content and navigation for support sites
 * Slug: happy-blocks/search-card
 * Categories: support
 *
 * @package happy-blocks
 */

if ( ! isset( $args ) ) {
	$args = array();
}

if ( ! function_exists( 'get_support_search_link_for_query' ) ) {
	function get_support_search_link_for_query( $query ) {
		$blog_id = get_current_blog_id();

		return add_query_arg(
			array(
				'group_id' => "blog_id:{$blog_id}",
				's'        => $query,
			)
		);
	}
}

?>
<div class="happy-blocks-search-card">
<!-- TODO: to be added later across the sites
	<ul class="navigation">
		<li class="active"><?php echo esc_html( __( 'Support Center', 'happy-blocks' ) ); ?></li>
		<li class="separator"></li>
		<li><?php echo esc_html( __( 'Guides', 'happy-blocks' ) ); ?></li>
		<li><?php echo esc_html( __( 'Courses', 'happy-blocks' ) ); ?></li>
		<li><?php echo esc_html( __( 'Forums', 'happy-blocks' ) ); ?></li>
		<li><?php echo esc_html( __( 'Contact', 'happy-blocks' ) ); ?></li>
	</ul>
-->
	<div class="content">
			<h2><?php echo esc_html( __( 'How can we help you?', 'happy-blocks' ) ); ?></h2>
			<form class="" role="search" method="get" action="">
				<div class="input-wrapper" dir="auto">
					<input id="support-search-input" type="search" name="s" placeholder="<?php esc_html_e( __( 'Search questions, guides, courses', 'happy-blocks' ) ); ?>" />

					<button type="submit" class="search-submit-button" aria-label="<?php esc_attr_e( __( 'Search', 'happy-blocks' ) ); ?>">
						<svg xmlns="http://www.w3.org/2000/svg" class="search-icon" width="24" height="24" viewBox="0 0 24 24" fill="none">
							<path d="M13 5C9.7 5 7 7.7 7 11C7 12.4 7.5 13.7 8.3 14.7L4.5 18.5L5.6 19.6L9.4 15.8C10.4 16.6 11.7 17.1 13.1 17.1C16.4 17.1 19.1 14.4 19.1 11.1C19.1 7.8 16.3 5 13 5ZM13 15.5C10.5 15.5 8.5 13.5 8.5 11C8.5 8.5 10.5 6.5 13 6.5C15.5 6.5 17.5 8.5 17.5 11C17.5 13.5 15.5 15.5 13 15.5Z"/>
						</svg>
					</button>
				</div>
			</form>

			<ul class="search-terms">
				<li><a href="<?php echo esc_url( get_support_search_link_for_query( 'connect a domain' ) ); ?>"><?php esc_html_e( __( 'Connect a domain', 'happy-blocks' ) ); ?></a></li>
				<li><a href="<?php echo esc_url( get_support_search_link_for_query( 'upgrade my plan' ) ); ?>"><?php esc_html_e( __( 'Upgrade my plan', 'happy-blocks' ) ); ?></a></li>
				<li><a href="<?php echo esc_url( get_support_search_link_for_query( 'grow an audience' ) ); ?>"><?php esc_html_e( __( 'Grow an audience', 'happy-blocks' ) ); ?></a></li>
				<li><a href="<?php echo esc_url( get_support_search_link_for_query( 'reset my password' ) ); ?>"><?php esc_html_e( __( 'Reset my password', 'happy-blocks' ) ); ?></a></li>
			</ul>
	</div>
</div>
