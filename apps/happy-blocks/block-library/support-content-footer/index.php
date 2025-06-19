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

$site_type         = isset( $args['site_type'] ) ? $args['site_type'] : '';
$current_page_slug = isset( $args['current_page_slug'] ) ? $args['current_page_slug'] : '';

if ( 'home' === $current_page_slug ) {
	//phpcs:ignore WPCOM.I18nRules.LocalizedUrl.LocalizedUrlAssignedToVariable
	$subscribe_block = '[wpcom_guides_learn_button is_unsubscribed_caption="' . __( 'Subscribe now!', 'happy-blocks' ) . '" is_subscribed_caption="' . __( 'Unsubscribe', 'happy-blocks' ) . '" busy_caption="' . __( 'Just a moment...', 'happy-blocks' ) . '"]';
	$signup_url      = localized_wpcom_url( 'https://wordpress.com/log-in?redirect_to=https%3A%2F%2Fwordpress.com%2Flearn%23support-content-subscribe' );
	?>

<div class="happy-blocks-support-content-footer">
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
	<?php if ( 'support' === $site_type ) : ?>
			<div class="support-content-resource">
				<h4 class="support-content-resource__title">
		<?php if ( get_locale() === 'en' ) : ?>
			<?php esc_html_e( 'Watch a course', 'happy-blocks' ); ?>
					<?php else : ?>
						<?php esc_html_e( 'Watch a course (in English)', 'happy-blocks' ); ?>
					<?php endif; ?>
				</h4>
				<p>
		<?php esc_html_e( 'Learn how to create a website with our step-by-step video course.', 'happy-blocks' ); ?>
		<?php if ( get_locale() !== 'en' ) : ?>
						<br /> <br /><em><?php esc_html_e( 'Available in English only.', 'happy-blocks' ); ?></em>
		<?php endif; ?>
				</p>
				<div class="resource-link">
					<a href="<?php echo esc_url( '//wordpress.com/support/courses/create-your-website/' ); ?>">
		<?php esc_html_e( 'Create your website', 'happy-blocks' ); ?>
					</a>
				</div>
			</div>
		<?php else : ?>
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
		<?php endif; ?>
	</div>
	<div class="support-content-links-subscribe">
	<?php
	include WP_CONTENT_DIR . '/a8c-plugins/happy-blocks/block-library/support-content-links/index.php';
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
	<?php
} elseif ( 'contact' === $current_page_slug ) {
	?>
	<div class="happy-blocks-new-support-content-footer contact-page">
		<div class="support-content-resources">
			<a href="<?php echo esc_url( localized_wpcom_url( 'https://wordpress.com/sites?help-center=wapuu' ) ); ?>" class="support-content-resource">
				<div class="support-content-resource__content">
					<div class="support-footer__icon-wrapper">
						<svg class="support-footer__icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
							<path d="M18 4H6C4.9 4 4 4.9 4 6V18.9C4 19.5 4.5 20 5.1 20C5.4 20 5.6 19.9 5.9 19.7L8.5 17H18C19.1 17 20 16.1 20 15V6C20 4.9 19.1 4 18 4ZM18.5 15C18.5 15.3 18.3 15.5 18 15.5H7.9L5.5 17.9V6C5.5 5.7 5.7 5.5 6 5.5H18C18.3 5.5 18.5 5.7 18.5 6V15Z" fill="white"/>
						</svg>
					</div>
					<h3 class="support-footer__card-title"><?php esc_html_e( 'Contact WordPress.com customer support', 'happy-blocks' ); ?></h3>
					<p class="support-footer__card-description"><?php esc_html_e( 'Get answers from our AI assistant, with access to 24/7 expert human support on paid plans.', 'happy-blocks' ); ?></p>
				</div>
			</a>
			<a href="<?php echo esc_url( localized_wpcom_url( 'https://wordpress.com/wp-login.php?action=recovery' ) ); ?>" class="support-content-resource">
				<div class="support-content-resource__content">
					<div class="support-footer__icon-wrapper">
						<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
							<path fill-rule="evenodd" clip-rule="evenodd" d="M7.25 16.437C6.3853 15.5113 5.80992 14.3531 5.59459 13.1048C5.37927 11.8565 5.53339 10.5725 6.038 9.41062C6.54261 8.24874 7.37573 7.25961 8.43493 6.56484C9.49413 5.87007 10.7333 5.49994 12 5.49994C13.2667 5.49994 14.5059 5.87007 15.5651 6.56484C16.6243 7.25961 17.4574 8.24874 17.962 9.41062C18.4666 10.5725 18.6207 11.8565 18.4054 13.1048C18.1901 14.3531 17.6147 15.5113 16.75 16.437V16C16.75 15.2707 16.4603 14.5712 15.9445 14.0555C15.4288 13.5397 14.7293 13.25 14 13.25H10C9.27065 13.25 8.57118 13.5397 8.05546 14.0555C7.53973 14.5712 7.25 15.2707 7.25 16V16.437ZM8.75 17.63C9.73766 18.2015 10.8589 18.5017 12 18.5C13.1411 18.5017 14.2623 18.2015 15.25 17.63V16C15.25 15.31 14.69 14.75 14 14.75H10C9.31 14.75 8.75 15.31 8.75 16V17.63ZM4 12C4 9.87827 4.84285 7.84344 6.34315 6.34315C7.84344 4.84285 9.87827 4 12 4C14.1217 4 16.1566 4.84285 17.6569 6.34315C19.1571 7.84344 20 9.87827 20 12C20 14.1217 19.1571 16.1566 17.6569 17.6569C16.1566 19.1571 14.1217 20 12 20C9.87827 20 7.84344 19.1571 6.34315 17.6569C4.84285 16.1566 4 14.1217 4 12ZM14 10C14 10.5304 13.7893 11.0391 13.4142 11.4142C13.0391 11.7893 12.5304 12 12 12C11.4696 12 10.9609 11.7893 10.5858 11.4142C10.2107 11.0391 10 10.5304 10 10C10 9.46957 10.2107 8.96086 10.5858 8.58579C10.9609 8.21071 11.4696 8 12 8C12.5304 8 13.0391 8.21071 13.4142 8.58579C13.7893 8.96086 14 9.46957 14 10Z" fill="white"/>
						</svg>
					</div>
					<h3 class="support-footer__card-title"><?php esc_html_e( 'Recover your WordPress.com account', 'happy-blocks' ); ?></h3>
					<p class="support-footer__card-description"><?php esc_html_e( 'Having trouble logging in to your account? Complete these easy steps to get back in.', 'happy-blocks' ); ?></p>
				</div>
			</a>
			<a href="<?php echo esc_url( localized_wpcom_url( 'https://wordpress.com/forums' ) ); ?>" class="support-content-resource">
				<div class="support-content-resource__content">
					<div class="support-footer__icon-wrapper">
						<svg class="support-footer__icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
							<path fill-rule="evenodd" clip-rule="evenodd" d="M15.5 9.5C15.7652 9.5 16.0196 9.39464 16.2071 9.20711C16.3946 9.01957 16.5 8.76522 16.5 8.5C16.5 8.23478 16.3946 7.98043 16.2071 7.79289C16.0196 7.60536 15.7652 7.5 15.5 7.5C15.2348 7.5 14.9804 7.60536 14.7929 7.79289C14.6054 7.98043 14.5 8.23478 14.5 8.5C14.5 8.76522 14.6054 9.01957 14.7929 9.20711C14.9804 9.39464 15.2348 9.5 15.5 9.5ZM15.5 11C16.163 11 16.7989 10.7366 17.2678 10.2678C17.7366 9.79893 18 9.16304 18 8.5C18 7.83696 17.7366 7.20107 17.2678 6.73223C16.7989 6.26339 16.163 6 15.5 6C14.837 6 14.2011 6.26339 13.7322 6.73223C13.2634 7.20107 13 7.83696 13 8.5C13 9.16304 13.2634 9.79893 13.7322 10.2678C14.2011 10.7366 14.837 11 15.5 11ZM13.25 17V15C13.25 14.2707 12.9603 13.5712 12.4445 13.0555C11.9288 12.5397 11.2293 12.25 10.5 12.25H6.5C5.77065 12.25 5.07118 12.5397 4.55546 13.0555C4.03973 13.5712 3.75 14.2707 3.75 15V17H5.25V15C5.25 14.31 5.81 13.75 6.5 13.75H10.5C11.19 13.75 11.75 14.31 11.75 15V17H13.25ZM20.25 15V17H18.75V15C18.75 14.31 18.19 13.75 17.5 13.75H15V12.25H17.5C18.2293 12.25 18.9288 12.5397 19.4445 13.0555C19.9603 13.5712 20.25 14.2707 20.25 15ZM9.5 8.5C9.5 8.76522 9.39464 9.01957 9.20711 9.20711C9.01957 9.39464 8.76522 9.5 8.5 9.5C8.23478 9.5 7.98043 9.39464 7.79289 9.20711C7.60536 9.01957 7.5 8.76522 7.5 8.5C7.5 8.23478 7.60536 7.98043 7.79289 7.79289C7.98043 7.60536 8.23478 7.5 8.5 7.5C8.76522 7.5 9.01957 7.60536 9.20711 7.79289C9.39464 7.98043 9.5 8.23478 9.5 8.5ZM11 8.5C11 9.16304 10.7366 9.79893 10.2678 10.2678C9.79893 10.7366 9.16304 11 8.5 11C7.83696 11 7.20107 10.7366 6.73223 10.2678C6.26339 9.79893 6 9.16304 6 8.5C6 7.83696 6.26339 7.20107 6.73223 6.73223C7.20107 6.26339 7.83696 6 8.5 6C9.16304 6 9.79893 6.26339 10.2678 6.73223C10.7366 7.20107 11 7.83696 11 8.5Z" fill="white"/>
						</svg>
					</div>
					<h3 class="support-footer__card-title"><?php esc_html_e( 'Ask a question in our forum', 'happy-blocks' ); ?></h3>
					<p class="support-footer__card-description"><?php esc_html_e( 'Browse questions and get answers from other experienced users.', 'happy-blocks' ); ?></p>
				</div>
			</a>
			<a href="<?php echo esc_url( localized_wpcom_url( 'https://wpchrg.wordpress.com' ) ); ?>" class="support-content-resource">
				<div class="support-content-resource__content">
					<div class="support-footer__icon-wrapper">
						<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
							<path fill-rule="evenodd" clip-rule="evenodd" d="M16.83 6.342L17.432 6.642L18.057 6.392L18.5 6.216V18.785L18.057 18.607L17.432 18.357L16.829 18.658L15.385 19.381L12.975 18.577L12.5 18.419L12.026 18.577L9.616 19.38L8.171 18.658L7.568 18.358L6.943 18.608L6.5 18.785V6.215L6.943 6.393L7.568 6.643L8.171 6.342L9.615 5.62L12.025 6.423L12.5 6.581L12.974 6.423L15.384 5.62L16.83 6.342ZM20 4L18.5 4.6L17.5 5L15.5 4L12.5 5L9.5 4L7.5 5L6.5 4.6L5 4V21L6.5 20.4L7.5 20L9.5 21L12.5 20L15.5 21L17.5 20L18.5 20.4L20 21V4ZM16.5 10.25V8.75H8.5V10.25H16.5ZM16.5 13.25V11.75H8.5V13.25H16.5ZM8.5 16.25V14.75H16.5V16.25H8.5Z" fill="white"/>
						</svg>
					</div>
					<h3 class="support-footer__card-title"><?php esc_html_e( 'Look up a recent charge', 'happy-blocks' ); ?></h3>
				<p class="support-footer__card-description"><?php esc_html_e( 'Do you have questions about a recent charge? Look up the details here.', 'happy-blocks' ); ?></p>
				</div>
			</a>
		</div>
	</div>
	<?php
} elseif ( 'courses-2' === $current_page_slug ) {
	?>
		<div class="happy-blocks-new-support-content-footer">
			<h2 class="support-footer__heading"><?php esc_html_e( 'Continue your learning journey', 'happy-blocks' ); ?></h2>
			<div class="support-content-resources">
				<a href="<?php echo esc_url( localized_wpcom_url( 'https://wordpress.com/support/guides/' ) ); ?>" class="support-content-resource">
					<div class="support-content-resource__content">
						<div class="support-footer__icon-wrapper">
							<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none">
  <path fill="#fff" d="M18 5.5H6a.5.5 0 0 0-.5.5v12a.5.5 0 0 0 .5.5h12a.5.5 0 0 0 .5-.5V6a.5.5 0 0 0-.5-.5ZM6 4h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Zm1 5h1.5v1.5H7V9Zm1.5 4.5H7V15h1.5v-1.5ZM10 9h7v1.5h-7V9Zm7 4.5h-7V15h7v-1.5Z"/>
</svg>
						</div>
						<h3 class="support-footer__card-title"><?php esc_html_e( 'Browse our guides', 'happy-blocks' ); ?></h3>
						<p class="support-footer__card-description"><?php esc_html_e( 'Find step-by-step solutions to common questions in our comprehensive guides.', 'happy-blocks' ); ?></p>
					</div>
				</a>
				<a href="<?php echo esc_url( localized_wpcom_url( 'https://wordpress.com/blog/' ) ); ?>" class="support-content-resource">
					<div class="support-content-resource__content">
						<div class="support-footer__icon-wrapper">
							<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none">
  <path fill="#fff" fill-rule="evenodd" d="M6 5.5h12a.5.5 0 0 1 .5.5v7H14a2 2 0 0 1-4 0H5.5V6a.5.5 0 0 1 .5-.5Zm-.5 9V18a.5.5 0 0 0 .5.5h12a.5.5 0 0 0 .5-.5v-3.5h-3.3a3.5 3.5 0 0 1-6.4 0H5.5ZM4 13V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-5Z" clip-rule="evenodd"/>
</svg>
						</div>
						<h3 class="support-footer__card-title"><?php esc_html_e( 'Subscribe to our blog', 'happy-blocks' ); ?></h3>
						<p class="support-footer__card-description"><?php esc_html_e( 'Sign up to get tips, tutorials, and all the latest news straight to your inbox.', 'happy-blocks' ); ?></p>
					</div>
				</a>
			</div>
		</div>
	<?php
} else {
	?>
		<div class="happy-blocks-new-support-content-footer">
			<h2 class="support-footer__heading"><?php esc_html_e( 'Couldn\'t find what you needed?', 'happy-blocks' ); ?></h2>
			<div class="support-content-resources">
				<a href="<?php echo esc_url( localized_wpcom_url( 'https://wordpress.com/support/contact/' ) ); ?>" class="support-content-resource">
					<div class="support-content-resource__content">
						<div class="support-footer__icon-wrapper">
							<svg class="support-footer__icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
								<path d="M18 4H6C4.9 4 4 4.9 4 6V18.9C4 19.5 4.5 20 5.1 20C5.4 20 5.6 19.9 5.9 19.7L8.5 17H18C19.1 17 20 16.1 20 15V6C20 4.9 19.1 4 18 4ZM18.5 15C18.5 15.3 18.3 15.5 18 15.5H7.9L5.5 17.9V6C5.5 5.7 5.7 5.5 6 5.5H18C18.3 5.5 18.5 5.7 18.5 6V15Z" fill="white"/>
							</svg>
						</div>
						<h3 class="support-footer__card-title"><?php esc_html_e( 'Contact us', 'happy-blocks' ); ?></h3>
						<p class="support-footer__card-description"><?php esc_html_e( 'Get answers from our AI assistant, with access to 24/7 expert human support on paid plans.', 'happy-blocks' ); ?></p>
					</div>
				</a>
				<a href="<?php echo esc_url( localized_wpcom_url( 'https://wordpress.com/forums/' ) ); ?>" class="support-content-resource">
					<div class="support-content-resource__content">
						<div class="support-footer__icon-wrapper">
							<svg class="support-footer__icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
								<path fill-rule="evenodd" clip-rule="evenodd" d="M15.5 9.5C15.7652 9.5 16.0196 9.39464 16.2071 9.20711C16.3946 9.01957 16.5 8.76522 16.5 8.5C16.5 8.23478 16.3946 7.98043 16.2071 7.79289C16.0196 7.60536 15.7652 7.5 15.5 7.5C15.2348 7.5 14.9804 7.60536 14.7929 7.79289C14.6054 7.98043 14.5 8.23478 14.5 8.5C14.5 8.76522 14.6054 9.01957 14.7929 9.20711C14.9804 9.39464 15.2348 9.5 15.5 9.5ZM15.5 11C16.163 11 16.7989 10.7366 17.2678 10.2678C17.7366 9.79893 18 9.16304 18 8.5C18 7.83696 17.7366 7.20107 17.2678 6.73223C16.7989 6.26339 16.163 6 15.5 6C14.837 6 14.2011 6.26339 13.7322 6.73223C13.2634 7.20107 13 7.83696 13 8.5C13 9.16304 13.2634 9.79893 13.7322 10.2678C14.2011 10.7366 14.837 11 15.5 11ZM13.25 17V15C13.25 14.2707 12.9603 13.5712 12.4445 13.0555C11.9288 12.5397 11.2293 12.25 10.5 12.25H6.5C5.77065 12.25 5.07118 12.5397 4.55546 13.0555C4.03973 13.5712 3.75 14.2707 3.75 15V17H5.25V15C5.25 14.31 5.81 13.75 6.5 13.75H10.5C11.19 13.75 11.75 14.31 11.75 15V17H13.25ZM20.25 15V17H18.75V15C18.75 14.31 18.19 13.75 17.5 13.75H15V12.25H17.5C18.2293 12.25 18.9288 12.5397 19.4445 13.0555C19.9603 13.5712 20.25 14.2707 20.25 15ZM9.5 8.5C9.5 8.76522 9.39464 9.01957 9.20711 9.20711C9.01957 9.39464 8.76522 9.5 8.5 9.5C8.23478 9.5 7.98043 9.39464 7.79289 9.20711C7.60536 9.01957 7.5 8.76522 7.5 8.5C7.5 8.23478 7.60536 7.98043 7.79289 7.79289C7.98043 7.60536 8.23478 7.5 8.5 7.5C8.76522 7.5 9.01957 7.60536 9.20711 7.79289C9.39464 7.98043 9.5 8.23478 9.5 8.5ZM11 8.5C11 9.16304 10.7366 9.79893 10.2678 10.2678C9.79893 10.7366 9.16304 11 8.5 11C7.83696 11 7.20107 10.7366 6.73223 10.2678C6.26339 9.79893 6 9.16304 6 8.5C6 7.83696 6.26339 7.20107 6.73223 6.73223C7.20107 6.26339 7.83696 6 8.5 6C9.16304 6 9.79893 6.26339 10.2678 6.73223C10.7366 7.20107 11 7.83696 11 8.5Z" fill="white"/>
							</svg>
						</div>
						<h3 class="support-footer__card-title"><?php esc_html_e( 'Ask a question in our forum', 'happy-blocks' ); ?></h3>
						<p class="support-footer__card-description"><?php esc_html_e( 'Browse questions and get answers from other experienced users.', 'happy-blocks' ); ?></p>
					</div>
				</a>
			</div>
		</div>
	<?php
}
