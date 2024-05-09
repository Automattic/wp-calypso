<?php
/**
 * Title: Footer content for support sites
 * Slug: happy-blocks/support-content-footer
 * Categories: support
 *
 * @package happy-blocks
 */

if ( ! isset( $args ) ) {
	$args = array();
}

//phpcs:ignore WPCOM.I18nRules.LocalizedUrl.LocalizedUrlAssignedToVariable
$image_dir       = 'https://wordpress.com/wp-content/a8c-plugins/happy-blocks/block-library/support-content-footer/build/assets';
$subscribe_block = '[wpcom_guides_learn_button is_unsubscribed_caption="' . __( 'Subscribe now!', 'happy-blocks' ) . '" is_subscribed_caption="' . __( 'Unsubscribe', 'happy-blocks' ) . '" busy_caption="' . __( 'Just a moment...', 'happy-blocks' ) . '"]';
$signup_url      = localized_wpcom_url( 'https://wordpress.com/log-in?redirect_to=https%3A%2F%2Fwordpress.com%2Flearn%23support-content-subscribe' );
?>

<div class="happy-blocks-support-content-footer">
	<div class="support-content-cta">
		<div class="support-content-cta-left">
			<h4 class="support-content-resource__title">
				<?php esc_html_e( 'Your site, built for you', 'happy-blocks' ); ?>
			</h4>
			<p>
				<?php esc_html_e( 'Sit back as our team of experts builds a site you\'ll fall in love with. From single page sites to full stores, they\'ll help you make it happen.', 'happy-blocks' ); ?>
			</p>
			<div class="resource-link">
				<a href="<?php echo esc_url( localized_wpcom_url( 'https://wordpress.com/website-design-service/?ref=banner-learn' ) ); ?>">
					<?php esc_html_e( 'Get Started', 'happy-blocks' ); ?>
				</a>
			</div>
		</div>

		<div class="support-content-cta-right">
			<img src="<?php echo esc_url( $image_dir . '/let-us-build-your-website.png' ); ?>" alt=""/>
		</div>
	</div>
	<div class="support-content-resources alignwide" style="border-radius:0px; margin-bottom:0px">
		<div class="support-content-resource">
			<h4 class="support-content-resource__title">
				<?php esc_html_e( 'Go further', 'happy-blocks' ); ?>
			</h4>
			<p>
			<?php esc_html_e( 'Upgrade and unlock features, tools, and expert help with a paid plan.', 'happy-blocks' ); ?>
			</p>
			<div class="resource-link">
				<a href="<?php echo esc_url( localized_wpcom_url( 'https://wordpress.com/pricing' ) ); ?>">
					<?php esc_html_e( 'View plans', 'happy-blocks' ); ?>
				</a>
			</div>
		</div>
		<div class="support-content-resource">
			<h4 class="support-content-resource__title">
				<?php esc_html_e( 'Join the forum', 'happy-blocks' ); ?>
			</h4>
			<p>
				<?php esc_html_e( 'Connect and learn with the WordPress.com community.', 'happy-blocks' ); ?>
			</p>
			<div class="resource-link">
				<a href="<?php echo esc_url( localized_wpcom_url( '//wordpress.com/forums/' ) ); ?>">
					<?php esc_html_e( 'Join the Community', 'happy-blocks' ); ?>
				</a>
			</div>
		</div>
		<div class="support-content-resource">
			<h4 class="support-content-resource__title">
				<?php esc_html_e( 'Check our guides', 'happy-blocks' ); ?>
			</h4>
			<p>
				<?php esc_html_e( 'Find and follow step-by-step guides for every WordPress.com question.', 'happy-blocks' ); ?>
			</p>
			<div class="resource-link">
				<a href="<?php echo esc_url( localized_wpcom_url( '//wordpress.com/support/' ) ); ?>">
					<?php esc_html_e( 'Visit support guides', 'happy-blocks' ); ?>
				</a>
			</div>
		</div>
	</div>
	<div class="support-content-links-subscribe">
		<?php
			require WP_CONTENT_DIR . '/a8c-plugins/happy-blocks/block-library/support-content-links/index.php';
		?>
		<div name="support-content-subscribe" class="support-content-subscribe">
			<p><?php esc_html_e( 'Get the latest learning in your inbox:', 'happy-blocks' ); ?></p>
			<div class="subscribe-shortcode-wrapper">
				<?php if ( is_user_logged_in() ) : ?>
				<div class="support-content-subscribe-email">
					<?php esc_html_e( 'Discover new learning updates', 'happy-blocks' ); ?>
				</div>
				<div class="support-content-subscribe-submit" type="submit">
					<?php echo do_shortcode( $subscribe_block ); ?>
				</div>
				<?php else : ?>
				<div class="support-content-subscribe-email">
					<a href="<?php echo esc_attr( $signup_url ); ?>"><?php esc_html_e( 'Create a WordPress.com account or log in to subscribe.', 'happy-blocks' ); ?></a>
				</div>
				<?php endif; ?>
			</div>
			<p class="support-content-subscribe-disclaimer">
				<?php
					// translators: %s: 'WordPress.com privacy policy'.
					printf( esc_html__( 'Your information will be used in accordance with %s.', 'happy-blocks' ), '<a href="https://automattic.com/privacy/">' . esc_html__( 'WordPress.com privacy policy', 'happy-blocks' ) . '</a>' );
				?>
			</p>
		</div>
	</div>
</div>
