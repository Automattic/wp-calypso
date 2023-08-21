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

?>
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
