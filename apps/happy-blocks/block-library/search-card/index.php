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

$is_front_page                 = isset( $args['is_front_page'] ) && ( true === $args['is_front_page'] );
$is_404_page                   = isset( $args['is_404_page'] ) && ( true === $args['is_404_page'] );
$active_page                   = isset( $args['active_page'] ) ? $args['active_page'] : '';
$should_show_search_card       = ( $is_front_page || $is_404_page ) && 'forums' !== $active_page;
$enable_odie_answers = ! is_user_logged_in() && ( 'treatment' === \ExPlat\assign_maybe_anon_user( 'wpcom_ai_on_logged_out_support_pages' )
	|| ( isset( $_GET['dotcom_support_enable_odie_answers'] ) && $_GET['dotcom_support_enable_odie_answers'] === 'true' ) );
$should_show_search_navigation = ( $is_front_page && $enable_odie_answers ) || ( ! $is_front_page && ! $is_404_page );

if ( ! function_exists( 'get_support_search_link_for_query' ) ) {
	function get_support_search_link_for_query( $query ) {
		$blog_id  = get_current_blog_id();
		$base_url = localized_wpcom_url( 'https://wordpress.com/support/' );

		return add_query_arg(
			array(
				'group_id' => "blog_id:{$blog_id}",
				's'        => $query,
			),
			$base_url
		);
	}
}

?>
<div class="happy-blocks-search-card<?php echo $should_show_search_card ? '' : ' navigation-only'; ?>">
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
			<?php if ( $should_show_search_navigation ) : ?>
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
			<?php if ( ! $should_show_search_navigation ) : ?>
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
	<?php if ( $should_show_search_card ) : ?>
		<?php
		$content_classes = array_filter(
			array(
				'support-search-content',
				$is_front_page ? 'is-front-page' : '',
				$is_404_page ? 'is-404-page' : '',
			)
		);
		?>
	<div class="<?php echo esc_attr( implode( ' ', $content_classes ) ); ?>">
			<h2><?php echo esc_html( $is_404_page ? __( "This page doesn't exist", 'happy-blocks' ) : __( 'How can we help you?', 'happy-blocks' ) ); ?></h2>
			<?php echo $is_404_page ? '<p class="subheading">' . esc_html( __( "Let's help you find what you're looking for.", 'happy-blocks' ) ) . '</p>' : ''; ?>
			<fieldset class="support-search-form-container" <?php echo $enable_odie_answers ? 'disabled="disabled"' : ''; ?>>
				<form id="support-search-form" class="" role="search" method="get" action="">
					<div class="input-wrapper" dir="auto">
						<?php if ( $enable_odie_answers ) : ?>
							<input id="support-search-input" type="input" data-post-loading-text="<?php echo esc_html( __( 'Ask us anything', 'happy-blocks' ) ); ?>" name="odie-query" placeholder="<?php echo esc_html( __( 'Loading...', 'happy-blocks' ) ); ?>"/>
							<button type="submit" class="search-submit-button-primary" aria-label="<?php echo esc_attr( __( 'Search', 'happy-blocks' ) ); ?>">
								<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
									<path d="M12.2197 5C12.4186 5 12.6094 5.07902 12.75 5.21967L17 9.46967C17.2929 9.76256 17.2929 10.2374 17 10.5303C16.7071 10.8232 16.2322 10.8232 15.9393 10.5303L12.9697 7.56067V18.25C12.9697 18.6642 12.6339 19 12.2197 19C11.8055 19 11.4697 18.6642 11.4697 18.25V7.56065L8.5 10.5303C8.2071 10.8232 7.73223 10.8232 7.43934 10.5303C7.14644 10.2374 7.14645 9.76256 7.43934 9.46967L11.6894 5.21967C11.83 5.07902 12.0208 5 12.2197 5Z" fill="currentColor"/>
								</svg>
							</button>
						<?php else : ?>
							<input id="support-search-input" type="search" name="s" placeholder="<?php echo esc_html( __( 'Search questions, guides, courses', 'happy-blocks' ) ); ?>"/>
							<button type="submit" class="search-submit-button" aria-label="<?php echo esc_attr( __( 'Search', 'happy-blocks' ) ); ?>">
								<svg xmlns="http://www.w3.org/2000/svg" class="search-icon" width="24" height="24" viewBox="0 0 24 24" fill="none">
									<path d="M13 5C9.7 5 7 7.7 7 11C7 12.4 7.5 13.7 8.3 14.7L4.5 18.5L5.6 19.6L9.4 15.8C10.4 16.6 11.7 17.1 13.1 17.1C16.4 17.1 19.1 14.4 19.1 11.1C19.1 7.8 16.3 5 13 5ZM13 15.5C10.5 15.5 8.5 13.5 8.5 11C8.5 8.5 10.5 6.5 13 6.5C15.5 6.5 17.5 8.5 17.5 11C17.5 13.5 15.5 15.5 13 15.5Z"/>
								</svg>
							</button>
						<?php endif; ?>
					</div>
				</form>

				<ul class="search-terms">
					<li><button data-search-query="<?php echo esc_attr( __( 'Connect a domain', 'happy-blocks' ) ); ?>" href="<?php echo esc_url( get_support_search_link_for_query( 'connect a domain' ) ); ?>"><?php echo esc_html( __( 'Connect a domain', 'happy-blocks' ) ); ?></button></li>
					<li><button data-search-query="<?php echo esc_attr( __( 'Upgrade my plan', 'happy-blocks' ) ); ?>" href="<?php echo esc_url( get_support_search_link_for_query( 'upgrade my plan' ) ); ?>"><?php echo esc_html( __( 'Upgrade my plan', 'happy-blocks' ) ); ?></button></li>
					<li><button data-search-query="<?php echo esc_attr( __( 'Add email', 'happy-blocks' ) ); ?>" href="<?php echo esc_url( get_support_search_link_for_query( 'add email' ) ); ?>"><?php echo esc_html( __( 'Add email', 'happy-blocks' ) ); ?></button></li>
					<li><button data-search-query="<?php echo esc_attr( __( 'Reset my password', 'happy-blocks' ) ); ?>" href="<?php echo esc_url( get_support_search_link_for_query( 'reset my password' ) ); ?>"><?php echo esc_html( __( 'Reset my password', 'happy-blocks' ) ); ?></button></li>
				</ul>
			</fieldset>
	</div>
	<?php endif; ?>
</div>
