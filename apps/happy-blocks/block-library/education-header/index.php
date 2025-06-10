<?php
/**
 * Title: Education Header
 * Slug: happy-blocks/education-header
 * Categories: support
 *
 * @package happy-blocks
 */

/**
 * Load functions from the h4 theme, we're using localized_tailored_flow_url here.
 */
require_once WP_CONTENT_DIR . '/themes/h4/landing/marketing/pages/_common/lib/functions.php';

if ( ! isset( $args ) ) {
	$args = array();
}

$happy_blocks_current_page = $args['active_page'];

if ( isset( $args['button_only'] ) && $args['button_only'] ) : ?>
<div class="happy-blocks_navigation_search">
	<a class="jetpack-search-filter__link" href="#">
		<svg xmlns="http://www.w3.org/2000/svg" class="search-icon" width="24" height="24" viewBox="0 0 24 24" fill="#1E1E1E">
			<path d="M13 5C9.7 5 7 7.7 7 11C7 12.4 7.5 13.7 8.3 14.7L4.5 18.5L5.6 19.6L9.4 15.8C10.4 16.6 11.7 17.1 13.1 17.1C16.4 17.1 19.1 14.4 19.1 11.1C19.1 7.8 16.3 5 13 5ZM13 15.5C10.5 15.5 8.5 13.5 8.5 11C8.5 8.5 10.5 6.5 13 6.5C15.5 6.5 17.5 8.5 17.5 11C17.5 13.5 15.5 15.5 13 15.5Z"/>
		</svg>
		<?php echo esc_html( __( 'Search', 'happy-blocks' ) ); ?>
	</a>
</div>
<?php else : ?>
<div class="happy-blocks-mini-search happy-blocks-header is-<?php echo esc_html( $happy_blocks_current_page ); ?>">
	<div class="happy-blocks-search-container">
		<div class="happy-blocks-global-header-site__title">
			<?php if ( $args['include_site_title'] ) : ?>
			<div class="happy-blocks-global-header-site__title__wrapper">
				<h1><?php echo esc_html( $args['site_title'] ); ?></h1>
				<p><?php echo esc_html( $args['site_tagline'] ); ?></p>
			</div>
			<?php endif; ?>
			<form class="<?php echo ! $args['include_site_title'] ? 'happy-blocks_inner_search' : ''; ?>" role="search"
				method="get" action=""><label for="wp-block-search__input-1"
					class="screen-reader-text"><?php echo esc_html( $args['search_placeholder'] ); ?></label>
				<div class="happy-blocks-search__inside-wrapper"><input type="search" id="wp-block-search__input-1"
						name="s" value="" placeholder="<?php echo esc_html( $args['search_placeholder'] ); ?>"></div>
			</form>
		</div>
	</div>
</div>
<?php endif; ?>
