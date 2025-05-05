<?php
/**
 * Title: Footer content for support sites
 * Slug: happy-blocks/support-content-footer
 * Categories: support
 *
 * @package happy-blocks
 */

if (! isset($args) ) {
    $args = array();
}

$site_type = isset($args['site_type']) ? $args['site_type'] : '';
$current_page_slug = isset($args['current_page_slug']) ? $args['current_page_slug'] : '';

if ('support_lp_2025' === $current_page_slug ) {
    ?>
        <div class="happy-blocks-new-support-content-footer">
            <h2 class="support-footer__heading"><?php esc_html_e('Couldn\'t find what you needed?', 'happy-blocks'); ?></h2>
            <div class="support-content-resources">
                <div class="support-content-resource">
                    <div class="support-footer__icon-wrapper">
                    <svg class="support-footer__icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M18 4H6C4.9 4 4 4.9 4 6V18.9C4 19.5 4.5 20 5.1 20C5.4 20 5.6 19.9 5.9 19.7L8.5 17H18C19.1 17 20 16.1 20 15V6C20 4.9 19.1 4 18 4ZM18.5 15C18.5 15.3 18.3 15.5 18 15.5H7.9L5.5 17.9V6C5.5 5.7 5.7 5.5 6 5.5H18C18.3 5.5 18.5 5.7 18.5 6V15Z" fill="white"/>
                    </svg>
                    </div>
                    <h3 class="support-footer__card-title"><?php esc_html_e('Contact us', 'happy-blocks'); ?></h3>
                    <p class="support-footer__card-description"><?php esc_html_e('Get answers from our AI assistant, with access to 24/7 expert human support on paid plans.', 'happy-blocks'); ?></p>
                </div>
                <div class="support-content-resource">
                    <div class="support-footer__icon-wrapper">
                        <svg class="support-footer__icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path fill-rule="evenodd" clip-rule="evenodd" d="M15.5 9.5C15.7652 9.5 16.0196 9.39464 16.2071 9.20711C16.3946 9.01957 16.5 8.76522 16.5 8.5C16.5 8.23478 16.3946 7.98043 16.2071 7.79289C16.0196 7.60536 15.7652 7.5 15.5 7.5C15.2348 7.5 14.9804 7.60536 14.7929 7.79289C14.6054 7.98043 14.5 8.23478 14.5 8.5C14.5 8.76522 14.6054 9.01957 14.7929 9.20711C14.9804 9.39464 15.2348 9.5 15.5 9.5ZM15.5 11C16.163 11 16.7989 10.7366 17.2678 10.2678C17.7366 9.79893 18 9.16304 18 8.5C18 7.83696 17.7366 7.20107 17.2678 6.73223C16.7989 6.26339 16.163 6 15.5 6C14.837 6 14.2011 6.26339 13.7322 6.73223C13.2634 7.20107 13 7.83696 13 8.5C13 9.16304 13.2634 9.79893 13.7322 10.2678C14.2011 10.7366 14.837 11 15.5 11ZM13.25 17V15C13.25 14.2707 12.9603 13.5712 12.4445 13.0555C11.9288 12.5397 11.2293 12.25 10.5 12.25H6.5C5.77065 12.25 5.07118 12.5397 4.55546 13.0555C4.03973 13.5712 3.75 14.2707 3.75 15V17H5.25V15C5.25 14.31 5.81 13.75 6.5 13.75H10.5C11.19 13.75 11.75 14.31 11.75 15V17H13.25ZM20.25 15V17H18.75V15C18.75 14.31 18.19 13.75 17.5 13.75H15V12.25H17.5C18.2293 12.25 18.9288 12.5397 19.4445 13.0555C19.9603 13.5712 20.25 14.2707 20.25 15ZM9.5 8.5C9.5 8.76522 9.39464 9.01957 9.20711 9.20711C9.01957 9.39464 8.76522 9.5 8.5 9.5C8.23478 9.5 7.98043 9.39464 7.79289 9.20711C7.60536 9.01957 7.5 8.76522 7.5 8.5C7.5 8.23478 7.60536 7.98043 7.79289 7.79289C7.98043 7.60536 8.23478 7.5 8.5 7.5C8.76522 7.5 9.01957 7.60536 9.20711 7.79289C9.39464 7.98043 9.5 8.23478 9.5 8.5ZM11 8.5C11 9.16304 10.7366 9.79893 10.2678 10.2678C9.79893 10.7366 9.16304 11 8.5 11C7.83696 11 7.20107 10.7366 6.73223 10.2678C6.26339 9.79893 6 9.16304 6 8.5C6 7.83696 6.26339 7.20107 6.73223 6.73223C7.20107 6.26339 7.83696 6 8.5 6C9.16304 6 9.79893 6.26339 10.2678 6.73223C10.7366 7.20107 11 7.83696 11 8.5Z" fill="white"/>
                        </svg>
                    </div>
                    <h3 class="support-footer__card-title"><?php esc_html_e('Ask a question in our forum', 'happy-blocks'); ?></h3>
                    <p class="support-footer__card-description"><?php esc_html_e('Browse questions and get answers from other experienced users.', 'happy-blocks'); ?></p>
                </div>
            </div>
        </div>
    <?php
} else {

	//phpcs:ignore WPCOM.I18nRules.LocalizedUrl.LocalizedUrlAssignedToVariable
    $subscribe_block = '[wpcom_guides_learn_button is_unsubscribed_caption="' . __('Subscribe now!', 'happy-blocks') . '" is_subscribed_caption="' . __('Unsubscribe', 'happy-blocks') . '" busy_caption="' . __('Just a moment...', 'happy-blocks') . '"]';
    $signup_url      = localized_wpcom_url('https://wordpress.com/log-in?redirect_to=https%3A%2F%2Fwordpress.com%2Flearn%23support-content-subscribe');
    ?>

<div class="happy-blocks-support-content-footer">
    <div class="support-content-resources alignwide" style="border-radius:0px; margin-bottom:0px">
        <div class="support-content-resource">
            <h4 class="support-content-resource__title">
                <?php esc_html_e('Go further', 'happy-blocks'); ?>
            </h4>
            <p>
    <?php esc_html_e('Upgrade and unlock features, tools, and expert help with a paid plan.', 'happy-blocks'); ?>
            </p>
            <div class="resource-link">
                <a href="<?php echo esc_url(localized_wpcom_url('https://wordpress.com/pricing')); ?>">
                    <?php esc_html_e('View plans', 'happy-blocks'); ?>
                </a>
            </div>
        </div>
        <div class="support-content-resource">
            <h4 class="support-content-resource__title">
                <?php esc_html_e('Join the forum', 'happy-blocks'); ?>
            </h4>
            <p>
                <?php esc_html_e('Connect and learn with the WordPress.com community.', 'happy-blocks'); ?>
            </p>
            <div class="resource-link">
                <a href="<?php echo esc_url(localized_wpcom_url('//wordpress.com/forums/')); ?>">
                    <?php esc_html_e('Join the Community', 'happy-blocks'); ?>
                </a>
            </div>
        </div>
    <?php if ($site_type === 'support' ) : ?>
            <div class="support-content-resource">
                <h4 class="support-content-resource__title">
        <?php if (get_locale() === 'en' ) : ?>
            <?php esc_html_e('Watch a course', 'happy-blocks'); ?>
                    <?php else : ?>
                        <?php esc_html_e('Watch a course (in English)', 'happy-blocks'); ?>
                    <?php endif; ?>
                </h4>
                <p>
        <?php esc_html_e('Learn how to create a website with our step-by-step video course.', 'happy-blocks'); ?>
        <?php if (get_locale() !== 'en' ) : ?>
                        <br /> <br /><em><?php esc_html_e('Available in English only.', 'happy-blocks'); ?></em>
        <?php endif; ?>
                </p>
                <div class="resource-link">
                    <a href="<?php echo esc_url('//wordpress.com/support/courses/create-your-website/'); ?>">
        <?php esc_html_e('Create your website', 'happy-blocks'); ?>
                    </a>
                </div>
            </div>
        <?php else : ?>
            <div class="support-content-resource">
                <h4 class="support-content-resource__title">
            <?php esc_html_e('Check our guides', 'happy-blocks'); ?>
                </h4>
                <p>
            <?php esc_html_e('Find and follow step-by-step guides for every WordPress.com question.', 'happy-blocks'); ?>
                </p>
                <div class="resource-link">
                    <a href="<?php echo esc_url(localized_wpcom_url('//wordpress.com/support/')); ?>">
                        <?php esc_html_e('Visit support guides', 'happy-blocks'); ?>
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
            <p><?php esc_html_e('Get the latest learning in your inbox:', 'happy-blocks'); ?></p>
            <div class="subscribe-shortcode-wrapper">
                <?php if (is_user_logged_in() ) : ?>
                <div class="support-content-subscribe-email">
                    <?php esc_html_e('Discover new learning updates', 'happy-blocks'); ?>
                </div>
                <div class="support-content-subscribe-submit" type="submit">
                    <?php echo do_shortcode($subscribe_block); ?>
                </div>
                <?php else : ?>
                <div class="support-content-subscribe-email">
                    <a href="<?php echo esc_attr($signup_url); ?>"><?php esc_html_e('Create a WordPress.com account or log in to subscribe.', 'happy-blocks'); ?></a>
                </div>
                <?php endif; ?>
            </div>
            <p class="support-content-subscribe-disclaimer">
                <?php
                    // translators: %s: 'WordPress.com privacy policy'.
                    printf(esc_html__('Your information will be used in accordance with %s.', 'happy-blocks'), '<a href="https://automattic.com/privacy/">' . esc_html__('WordPress.com privacy policy', 'happy-blocks') . '</a>');
                ?>
            </p>
        </div>
    </div>
    </div>
    <?php
}
