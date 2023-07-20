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

$image_dir = 'https://wordpress.com/wp-content/a8c-plugins/happy-blocks/block-library/support-content-footer/build/assets';
?>

<div class="happy-blocks-support-content-footer">
	<div class="support-content-cta">
		<div class="support-content-cta-left">
			<h4 class="support-content-resource__title">
				<?php esc_html_e( 'Let us build your website', 'happy-blocks' ); ?>
			</h4>
			<p>
				<?php esc_html_e( 'Our professional website-building service can create the site of your dreams, no matter the scope of your project - from small websites and personal blogs to large-scale custom development and migrations.', 'happy-blocks' ); ?>
			</p>
			<div class="resource-link">
				<a href="<?php echo esc_url( 'https://wordpress.com/website-design-service/?ref=banner-learn' ); ?>">
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
		<div class="support-content-links">
			<p>
				<?php esc_html_e( 'Questions?', 'happy-blocks' ); ?>
				<a href="<?php echo esc_url( 'https://wordpress.com/help/contact/' ); ?>" target="_blank" rel="noreferrer noopener">
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
				<a href="<?php echo esc_url( 'https://wordpress.com/support/start/' ); ?>" target="_blank" rel="noreferrer noopener">
					<?php esc_html_e( 'Find your perfect-fit plan here.', 'happy-blocks' ); ?>
				</a>
			</p>
		</div>
		<div class="support-content-subscribe">
			<p><?php esc_html_e( 'Sign up for educational resources updates:', 'happy-blocks' ); ?></p>
			<form action="https://subscribe.wordpress.com" method="post" accept-charset="utf-8" data-blog="<?php echo get_current_blog_id(); ?>" data-post_access_level="everybody" id="subscribe-blog">
				<input class="support-content-subscribe-email" required="required" type="email" name="email" placeholder="<?php esc_html_e( 'Enter your best email', 'happy-blocks' ); ?>"  id="subscribe-field">
				<input type="hidden" name="action" value="subscribe">
				<input type="hidden" name="blog_id" value="<?php echo get_current_blog_id(); ?>">
				<input type="hidden" name="sub-type" value="subscribe-block">
				<input type="hidden" name="redirect_fragment" value="subscribe-blog">
				<input type="hidden" id="_wpnonce" name="_wpnonce" value="cfa1e9a8e2">
				<button class="support-content-subscribe-submit" type="submit">
					<?php esc_html_e( 'Subscribe', 'happy-blocks' ); ?>
				</button>
			</form>
			<p class="support-content-subscribe-disclaimer">
				<?php
					// translators: %s: 'WordPress.com privacy policy'.
					echo sprintf( esc_html__( 'Your information will be used in accordance with %s.', 'happy-blocks' ), '<a href="https://automattic.com/privacy/">' . esc_html__( 'WordPress.com privacy policy', 'happy-blocks' ) . '</a>' );
				?>
			</p>
		</div>
	</div>
</div>
