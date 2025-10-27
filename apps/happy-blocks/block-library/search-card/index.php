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

$is_frontpage = isset( $args['is-frontpage'] ) && ( true === $args['is-frontpage'] );
$active_page = isset( $args['active_page'] ) ? $args['active_page'] : '';



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
<div class="happy-blocks-search-card<?php echo $is_frontpage ? '' : ' navigation-only'; ?>">
	<nav class="navigation-header">
		<!-- Desktop navigation -->
		<div class="desktop-nav-container">
			<ul class="navigation desktop-nav">
				<li class="active"><a href="<?php echo esc_url( localized_wpcom_url( 'https://wordpress.com/support/' ) ); ?>"><?php echo esc_html( __( 'Support Center', 'happy-blocks' ) ); ?></a></li>
				<li class="separator"></li>
				<li class="<?php echo ( 'guides' === $active_page ) ? 'active' : ''; ?>"><a href="<?php echo esc_url( localized_wpcom_url( 'https://wordpress.com/support/guides/' ) ); ?>"><?php echo esc_html( __( 'Guides', 'happy-blocks' ) ); ?></a></li>
				<li class="<?php echo ( 'courses' === $active_page ) ? 'active' : ''; ?>"><a href="<?php echo esc_url( localized_wpcom_url( 'https://wordpress.com/support/courses/' ) ); ?>"><?php echo esc_html( __( 'Courses', 'happy-blocks' ) ); ?></a></li>
				<li class="<?php echo ( 'forums' === $active_page ) ? 'active' : ''; ?>"><a href="<?php echo esc_url( localized_wpcom_url( 'https://wordpress.com/forums/' ) ); ?>"><?php echo esc_html( __( 'Forums', 'happy-blocks' ) ); ?></a></li>
				<li class="<?php echo ( 'contact' === $active_page ) ? 'active' : ''; ?>"><a href="<?php echo esc_url( localized_wpcom_url( 'https://wordpress.com/support/contact/' ) ); ?>"><?php echo esc_html( __( 'Contact', 'happy-blocks' ) ); ?></a></li>
			</ul>
			
			<!-- Search button -->
			<?php if ( ! $is_frontpage ) : ?>
			<div class="happy-blocks_navigation_search">
				<a class="jetpack-search-filter__link" href="#">
					<svg xmlns="http://www.w3.org/2000/svg" class="search-icon" width="24" height="24" viewBox="0 0 24 24" fill="#1E1E1E">
						<path d="M13 5C9.7 5 7 7.7 7 11C7 12.4 7.5 13.7 8.3 14.7L4.5 18.5L5.6 19.6L9.4 15.8C10.4 16.6 11.7 17.1 13.1 17.1C16.4 17.1 19.1 14.4 19.1 11.1C19.1 7.8 16.3 5 13 5ZM13 15.5C10.5 15.5 8.5 13.5 8.5 11C8.5 8.5 10.5 6.5 13 6.5C15.5 6.5 17.5 8.5 17.5 11C17.5 13.5 15.5 15.5 13 15.5Z"/>
					</svg>
					<?php echo esc_html( __( 'Search', 'happy-blocks' ) ); ?>
				</a>
			</div>
			<?php endif; ?>
		</div>
		
		<div class="mobile-nav-container">
			<!-- Mobile dropdown navigation -->
			<div class="mobile-nav-dropdown">
				<button class="dropdown-trigger" aria-haspopup="true" aria-expanded="false">
					<span class="dropdown-current">
						<span class="support-center-text"><?php echo esc_html( __( 'Support Center', 'happy-blocks' ) ); ?></span>
						<?php if ( empty( $active_page ) || 'support' !== $active_page ) : ?>
							<span class="separator">/</span>
							<span class="active-page-text">
								<?php
								switch ( $active_page ) {
									case 'guides':
										echo esc_html( __( 'Guides', 'happy-blocks' ) );
										break;
									case 'courses':
										echo esc_html( __( 'Courses', 'happy-blocks' ) );
										break;
									case 'forums':
										echo esc_html( __( 'Forums', 'happy-blocks' ) );
										break;
									case 'contact':
										echo esc_html( __( 'Contact', 'happy-blocks' ) );
										break;
								}
								?>
							</span>
						<?php endif; ?>
					</span>
					<svg class="dropdown-arrow" width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
					</svg>
				</button>
				<ul class="dropdown-menu" role="menu">
					<li><a href="<?php echo esc_url( localized_wpcom_url( 'https://wordpress.com/support/' ) ); ?>" class="<?php echo ( 'support' === $active_page ) ? 'active' : ''; ?>" role="menuitem"><?php echo esc_html( __( 'Support Center', 'happy-blocks' ) ); ?></a></li>
					<li><a href="<?php echo esc_url( localized_wpcom_url( 'https://wordpress.com/support/guides/' ) ); ?>" class="<?php echo ( 'guides' === $active_page ) ? 'active' : ''; ?>" role="menuitem"><?php echo esc_html( __( 'Guides', 'happy-blocks' ) ); ?></a></li>
					<li><a href="<?php echo esc_url( localized_wpcom_url( 'https://wordpress.com/support/courses/' ) ); ?>" class="<?php echo ( 'courses' === $active_page ) ? 'active' : ''; ?>" role="menuitem"><?php echo esc_html( __( 'Courses', 'happy-blocks' ) ); ?></a></li>
					<li><a href="<?php echo esc_url( localized_wpcom_url( 'https://wordpress.com/forums/' ) ); ?>" class="<?php echo ( 'forums' === $active_page ) ? 'active' : ''; ?>" role="menuitem"><?php echo esc_html( __( 'Forums', 'happy-blocks' ) ); ?></a></li>
					<li><a href="<?php echo esc_url( localized_wpcom_url( 'https://wordpress.com/support/contact/' ) ); ?>" class="<?php echo ( 'contact' === $active_page ) ? 'active' : ''; ?>" role="menuitem"><?php echo esc_html( __( 'Contact', 'happy-blocks' ) ); ?></a></li>
				</ul>
			</div>

			<!-- Search button -->
			<?php if ( ! $is_frontpage ) : ?>
			<div class="happy-blocks_navigation_search">
				<a class="jetpack-search-filter__link" href="#">
					<svg xmlns="http://www.w3.org/2000/svg" class="search-icon" width="24" height="24" viewBox="0 0 24 24" fill="#1E1E1E">
						<path d="M13 5C9.7 5 7 7.7 7 11C7 12.4 7.5 13.7 8.3 14.7L4.5 18.5L5.6 19.6L9.4 15.8C10.4 16.6 11.7 17.1 13.1 17.1C16.4 17.1 19.1 14.4 19.1 11.1C19.1 7.8 16.3 5 13 5ZM13 15.5C10.5 15.5 8.5 13.5 8.5 11C8.5 8.5 10.5 6.5 13 6.5C15.5 6.5 17.5 8.5 17.5 11C17.5 13.5 15.5 15.5 13 15.5Z"/>
					</svg>
				</a>
			</div>
			<?php endif; ?>
		</div>
	</nav>
	<?php if ( $is_frontpage ) : ?>
	<div class="support-search-content">
			<h2><?php echo esc_html( __( 'How can we help you?', 'happy-blocks' ) ); ?></h2>
			<form id="support-search-form" class="" role="search" method="get" action="">
				<div class="input-wrapper" dir="auto">
					<input id="support-search-input" type="search" name="s" placeholder="<?php echo esc_html( __( 'Search questions, guides, courses', 'happy-blocks' ) ); ?>"/>

					<button type="submit" class="search-submit-button" aria-label="<?php echo esc_attr( __( 'Search', 'happy-blocks' ) ); ?>">
						<svg xmlns="http://www.w3.org/2000/svg" class="search-icon" width="24" height="24" viewBox="0 0 24 24" fill="none">
							<path d="M13 5C9.7 5 7 7.7 7 11C7 12.4 7.5 13.7 8.3 14.7L4.5 18.5L5.6 19.6L9.4 15.8C10.4 16.6 11.7 17.1 13.1 17.1C16.4 17.1 19.1 14.4 19.1 11.1C19.1 7.8 16.3 5 13 5ZM13 15.5C10.5 15.5 8.5 13.5 8.5 11C8.5 8.5 10.5 6.5 13 6.5C15.5 6.5 17.5 8.5 17.5 11C17.5 13.5 15.5 15.5 13 15.5Z"/>
						</svg>
					</button>
				</div>
			</form>

			<ul class="search-terms">
				<li><a data-search-query="<?php echo esc_attr( __( 'Connect a domain', 'happy-blocks' ) ); ?>" href="<?php echo esc_url( get_support_search_link_for_query( 'connect a domain' ) ); ?>"><?php echo esc_html( __( 'Connect a domain', 'happy-blocks' ) ); ?></a></li>
				<li><a data-search-query="<?php echo esc_attr( __( 'Upgrade my plan', 'happy-blocks' ) ); ?>" href="<?php echo esc_url( get_support_search_link_for_query( 'upgrade my plan' ) ); ?>"><?php echo esc_html( __( 'Upgrade my plan', 'happy-blocks' ) ); ?></a></li>
				<li><a data-search-query="<?php echo esc_attr( __( 'Add email', 'happy-blocks' ) ); ?>" href="<?php echo esc_url( get_support_search_link_for_query( 'add email' ) ); ?>"><?php echo esc_html( __( 'Add email', 'happy-blocks' ) ); ?></a></li>
				<li><a data-search-query="<?php echo esc_attr( __( 'Reset my password', 'happy-blocks' ) ); ?>" href="<?php echo esc_url( get_support_search_link_for_query( 'reset my password' ) ); ?>"><?php echo esc_html( __( 'Reset my password', 'happy-blocks' ) ); ?></a></li>
			</ul>
	</div>
	<?php endif; ?>
</div>
