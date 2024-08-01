<?php
/**
 * Title: Support content links
 * Slug: happy-blocks/support-content-links
 * Categories: support
 *
 * @package happy-blocks
 */

?>
<div class="support-content-links">
	<p>
		<?php esc_html_e( 'Questions?', 'happy-blocks' ); ?>
		<a href="<?php echo esc_url( localized_wpcom_url( 'https://wordpress.com/help?help-center=wapuu' ) ); ?>" target="_blank" rel="noreferrer noopener">
			<?php esc_html_e( 'Contact our Happiness Engineers.', 'happy-blocks' ); ?>
		</a>
	</p>
	<p>
		<?php esc_html_e( 'Self-hosted WordPress site?', 'happy-blocks' ); ?>
		<a href="<?php echo esc_url( 'http://wordpress.org/support' ); ?>" target="_blank" rel="noreferrer noopener">
			<?php esc_html_e( 'Find support here.', 'happy-blocks' ); ?>
		</a>
	</p>
	<p>
		<?php esc_html_e( 'New to WordPress.com? ', 'happy-blocks' ); ?>
		<a href="<?php echo esc_url( localized_wpcom_url( 'https://wordpress.com/plans/' ) ); ?>" target="_blank" rel="noreferrer noopener">
			<?php esc_html_e( 'Find your perfect-fit plan here.', 'happy-blocks' ); ?>
		</a>
	</p>
</div>
