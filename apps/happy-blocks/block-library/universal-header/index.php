<?php
/**
 * Title: Search Bar with Heading
 * Slug: happy-blocks/search
 * Categories: support
 *
 * @package happy-blocks
 */

if ( ! isset( $args ) ) {
	$args = array();
}

$happy_blocks_current_tab = $args['active_tab'];

$happy_blocks_tabs = array(
	'learn'   => array(
		'title' => __( 'Learn', 'happy-blocks' ),
		'url'   => 'https://wordpress.com/learn',
	),
	'support' => array(
		'title' => __( 'Support', 'happy-blocks' ),
		'url'   => localized_wpcom_url( 'https://wordpress.com/support' ),
	),
	'forums'  => array(
		'title' => __( 'Forums', 'happy-blocks' ),
		'url'   => localized_wpcom_url( 'https://wordpress.com/forums' ),
	),
)
?>

<div id="lpc-header-nav" class="lpc lpc-header-nav">
	<div class="x-root lpc-header-nav-wrapper">
		<div class="lpc-header-nav-container">
			<!-- Nav bar starts here. -->
			<div class="masterbar-menu">
				<div class="masterbar">
					<nav class="x-nav" aria-label="<?php esc_attr_e( 'WordPress.com Navigation', 'happy-blocks' ); ?>">
						<ul class="x-nav-list x-nav-list--left" role="menu">
							<li class="x-nav-item" role="menuitem">
								<a class="x-nav-link x-nav-link--logo x-link" href="<?php echo esc_url( localized_wpcom_url( '//wordpress.com/' ) ); ?>">
									<svg width="170" height="36" xmlns="http://www.w3.org/2000/svg" class="x-icon x-icon--logo" role="img" aria-hidden="true" focusable="false">
										<path d="M47.57 10l-2.79 10.72L41.99 10h-2.81l.65 2.3-2.45 8.78L34.7 10H32l3.8 14h2.96l2.28-7.49L43.17 24h2.95l4-14h-2.55zm28.39 4.06a9 9 0 00-1.86-.23c-3.4 0-5.26 2.27-5.26 5.6 0 3.31 1.86 4.82 4.05 4.82a5.45 5.45 0 003.2-1.17V24h2.33V10h-2.46v4.06zm0 7.08c-.8.73-1.55 1.13-2.34 1.13-1.36 0-2.23-.9-2.23-3.01 0-2.28 1.08-3.47 2.96-3.47.55 0 1.1.11 1.6.31v5.04zM64.2 15.7h-.09v-1.64h-2.3V24h2.47v-5.92c.77-1.46 1.71-1.94 3.28-1.94h.25V14a6.67 6.67 0 00-.67-.04c-1.34 0-2.26.52-2.94 1.75zm83.14-1.89c-3.4 0-5.01 2.2-5.01 5.23 0 3.02 1.6 5.2 5.01 5.2s5.01-2.18 5.01-5.2c0-3.03-1.63-5.23-5.02-5.23h.01zm0 8.44c-1.6 0-2.46-1.04-2.46-3.21 0-2.18.85-3.22 2.46-3.22 1.6 0 2.44 1.04 2.44 3.22 0 2.17-.84 3.21-2.45 3.21h.01zm19.12-8.44c-1.06 0-2.28.58-3.38 1.32l-.3.19c-.51-1.11-1.56-1.5-2.71-1.5-1.06 0-2.27.54-3.38 1.27v-1.03h-2.34V24h2.48v-7.13a5.3 5.3 0 012.61-.98c.81 0 1.32.44 1.32 1.84V24h2.46v-7.1c.92-.6 1.9-1 2.6-1 .82 0 1.32.43 1.32 1.84V24h2.46v-6.86c0-1.92-1.14-3.32-3.15-3.32zm-111.64 0c-3.4 0-5 2.2-5 5.23 0 3.02 1.6 5.2 5 5.2s5.02-2.18 5.02-5.2c0-3.03-1.64-5.23-5.03-5.23h.01zm0 8.44c-1.6 0-2.46-1.04-2.46-3.21 0-2.18.86-3.22 2.47-3.22 1.6 0 2.44 1.04 2.44 3.22 0 2.17-.85 3.21-2.46 3.21h.01zm40.31-6.56h-.08v-1.63h-2.31V24h2.46v-5.92c.77-1.46 1.71-1.94 3.28-1.94h.25V14a6.67 6.67 0 00-.67-.04c-1.33 0-2.25.52-2.94 1.75h.01zM86.05 10h-4.58v14h2.64v-4.87h1.93c2.99 0 5.16-1.61 5.16-4.62 0-3-2.17-4.51-5.16-4.51zm.02 7.08h-1.96v-5.01h1.95c1.6 0 2.38.88 2.38 2.44 0 1.57-.73 2.57-2.38 2.57h.01zm36.02-.23c0-.75.82-1.04 1.7-1.04.93.01 1.86.16 2.75.43V14.2a10.14 10.14 0 00-2.95-.38c-2.38 0-4.05 1.13-4.05 2.97 0 3.57 4.92 2.65 4.92 4.39 0 .85-.77 1.08-1.9 1.08-.8 0-2.07-.3-2.99-.63v2.03a8.29 8.29 0 002.9.59c2.32 0 4.53-.69 4.53-3.17.03-3.45-4.9-2.56-4.9-4.23zm-17.5-3.03c-3.18 0-4.83 2.47-4.83 5.16 0 3.7 1.94 5.27 5.1 5.27a11.81 11.81 0 003.65-.57v-2.05c-1.03.38-1.97.61-2.97.61-1.84 0-3.07-.5-3.13-2.67h6.36c.06-.49.09-.98.08-1.46 0-2.1-1.11-4.29-4.27-4.29zm-2.16 4.12c.15-1.38.9-2.26 2.13-2.26 1.32 0 1.72 1.05 1.72 2.26h-3.85zm10.7-1.09c0-.75.81-1.04 1.69-1.04.93.01 1.86.16 2.75.43V14.2a10.14 10.14 0 00-2.94-.38c-2.38 0-4.06 1.13-4.06 2.97 0 3.57 4.93 2.65 4.93 4.39 0 .85-.78 1.08-1.9 1.08-.8 0-2.07-.3-3-.63v2.03a8.28 8.28 0 002.9.59c2.32 0 4.54-.69 4.54-3.17.02-3.45-4.91-2.56-4.91-4.23zm21.97 2.1c0-2.33 1.27-3.12 2.78-3.12.94.03 1.88.22 2.76.57v-2.1a8.11 8.11 0 00-2.8-.48c-3.28 0-5.31 2-5.31 5.25 0 3.07 1.46 5.18 5.16 5.18 1.17 0 2.08-.23 3.08-.57v-2.04c-1.13.43-2 .6-2.77.6-1.63 0-2.9-.75-2.9-3.3zM128.66 24h2.47v-2.55h-2.47V24zM1.72 16c0 4.47 2.6 8.32 6.36 10.15L2.7 11.41A11.24 11.24 0 001.72 16zM13 27.28c1.31 0 2.57-.23 3.75-.64l-.08-.15-3.47-9.5-3.38 9.83c1 .3 2.07.46 3.18.46zm1.55-16.57l4.08 12.13 1.13-3.76c.48-1.56.85-2.68.85-3.65 0-1.4-.5-2.36-.92-3.1-.58-.94-1.11-1.73-1.11-2.65 0-1.04.78-2 1.9-2h.14A11.24 11.24 0 0013 4.72 11.27 11.27 0 003.58 9.8l.72.02c1.18 0 3-.15 3-.15.62-.03.69.86.08.93 0 0-.61.08-1.3.11l4.12 12.22 2.47-7.4-1.76-4.82a20.13 20.13 0 01-1.18-.1c-.61-.04-.54-.97.07-.94 0 0 1.86.15 2.97.15 1.18 0 3-.15 3-.15.61-.03.69.86.08.93 0 0-.61.07-1.3.11zm4.12 15.04A11.28 11.28 0 0024.28 16c0-1.96-.5-3.8-1.38-5.41a10.65 10.65 0 01-.78 5.2l-3.45 9.96zM13 29a13 13 0 110-26 13 13 0 010 26z"></path>
									</svg>
									<span class="x-hidden"><?php esc_html_e( 'WordPress.com', 'happy-blocks' ); ?></span>
								</a>
							</li>
							<li class="x-nav-item x-nav-item--wide">
								<a role="menuitem" class="x-nav-link x-link" href="<?php echo esc_url( localized_wpcom_url( 'https://wordpress.com/forums/' ) ); ?>">
									<?php esc_html_e( 'Forums', 'happy-blocks' ); ?>
								</a>
							</li>
							<li class="x-nav-item x-nav-item--wide" role="menuitem">
								<button class="x-nav-link x-link" data-dropdown-trigger="products" aria-haspopup="true" aria-expanded="false">
									<?php esc_html_e( 'Products', 'happy-blocks' ); ?> <span class="x-nav-link-chevron" aria-hidden="true"></span>
								</button>
							</li>
							<li class="x-nav-item x-nav-item--wide" role="menuitem">
								<button class="x-nav-link x-link" data-dropdown-trigger="features" aria-haspopup="true" aria-expanded="false">
									<?php esc_html_e( 'Features', 'happy-blocks' ); ?> <span class="x-nav-link-chevron" aria-hidden="true"></span>
								</button>
							</li>
							<li class="x-nav-item x-nav-item--wide" role="menuitem">
								<button class="x-nav-link x-link" data-dropdown-trigger="resources" aria-haspopup="true" aria-expanded="false">
									<?php esc_html_e( 'Resources', 'happy-blocks' ); ?> <span class="x-nav-link-chevron" aria-hidden="true"></span>
								</button>
							</li>
							<li class="x-nav-item x-nav-item--wide" role="menuitem">
								<a class="x-nav-link x-link" href="<?php echo esc_url( localized_wpcom_url( '//wordpress.com/pricing/' ) ); ?>" title="<?php esc_attr_e( 'Plans &amp; Pricing', 'happy-blocks' ); ?>">
									<?php esc_html_e( 'Plans &amp; Pricing', 'happy-blocks' ); ?>
								</a>
							</li>
						</ul>
						<ul class="x-nav-list x-nav-list--right" role="menu">
							<?php if ( ! is_user_logged_in() ) : ?>
							<li role="menuitem" class="x-nav-item x-nav-item--wide login-link">
								<a class="x-nav-link x-link" href="<?php echo esc_url( localized_wpcom_url( '//wordpress.com/log-in/' ) ); ?>" title="<?php esc_attr_e( 'Log In', 'happy-blocks' ); ?>">
									<?php esc_html_e( 'Log In', 'happy-blocks' ); ?>
								</a>
							</li>
							<?php endif; ?>
							<li role="menuitem" class="x-nav-item x-nav-item--wide get-started-btn">
								<a class="x-nav-link x-nav-link--primary x-link" href="<?php echo esc_url( localized_wpcom_url( 'https://wordpress.com/start/' ) ); ?>" title="<?php esc_attr_e( 'Get Started', 'happy-blocks' ); ?>">
									<?php esc_html_e( 'Get Started', 'happy-blocks' ); ?>
								</a>
							</li>
							<li role="menuitem" class="x-nav-item x-nav-item--narrow">
								<button class="x-nav-link x-nav-link--menu x-link" aria-haspopup="true" aria-expanded="false">
									<span class="x-hidden"><?php esc_html_e( 'Menu', 'happy-blocks' ); ?></span>
									<span class="x-icon x-icon--menu">
										<span></span>
										<span></span>
										<span></span>
									</span>
								</button>
							</li>
						</ul>
					</nav>
				</div>
			</div>
			<!-- Nav bar ends here. -->

			<!-- Desktop dropdowns start here. -->
			<div class="x-dropdown">
				<div class="x-dropdown-top">
					<div class="x-dropdown-top-fill"></div>
				</div>
				<div class="x-dropdown-middle"></div>
				<div class="x-dropdown-bottom">
					<div class="x-dropdown-bottom-fill"></div>
				</div>
				<div class="x-dropdown-content" data-dropdown-name="products" role="menu" aria-label="<?php esc_attr_e( 'Products', 'happy-blocks' ); ?>" aria-hidden="true">
					<ul role="menu">
						<li>
							<a role="menuitem" class="x-dropdown-link x-link" href="<?php echo esc_url( localized_wpcom_url( '//wordpress.com/hosting/' ) ); ?>" title="<?php echo esc_attr( fixme__( 'WordPress Hosting', __( 'Hosting', 'happy-blocks' ) ) ); ?>" tabindex="-1">
								<?php echo esc_html( fixme__( 'WordPress Hosting', __( 'Hosting', 'happy-blocks' ) ) ); ?>
							</a>
						</li>
						<li>
							<a role="menuitem" class="x-dropdown-link x-link" href="<?php echo esc_url( localized_wpcom_url( '//wordpress.com/domains/' ) ); ?>" title="<?php echo esc_attr( fixme__( 'Domain Names', __( 'Domains', 'happy-blocks' ) ) ); ?>" tabindex="-1">
								<?php echo esc_html( fixme__( 'Domain Names', __( 'Domains', 'happy-blocks' ) ) ); ?>
							</a>
						</li>
						<li>
							<a role="menuitem" class="x-dropdown-link x-link" href="<?php echo esc_url( localized_wpcom_url( '//wordpress.com/website-builder/' ) ); ?>" title="<?php esc_attr_e( 'Website Builder', 'happy-blocks' ); ?>" tabindex="-1">
								<?php esc_html_e( 'Website Builder', 'happy-blocks' ); ?>
							</a>
						</li>
						<li>
							<a role="menuitem" class="x-dropdown-link x-link" href="<?php echo esc_url( localized_wpcom_url( '//wordpress.com/create-blog/' ) ); ?>" title="<?php echo esc_attr( fixme__( 'Create a Blog', __( 'Blogs', 'happy-blocks' ) ) ); ?>" tabindex="-1">
								<?php echo esc_html( fixme__( 'Create a Blog', __( 'Blogs', 'happy-blocks' ) ) ); ?>
							</a>
						</li>
						<li>
							<a role="menuitem" class="x-dropdown-link x-link" href="<?php echo esc_url( localized_wpcom_url( '//wordpress.com/professional-email/' ) ); ?>" title="<?php echo esc_attr( fixme__( 'Professional Email', __( 'Email', 'happy-blocks' ) ) ); ?>" tabindex="-1">
								<?php echo esc_html( fixme__( 'Professional Email', __( 'Email', 'happy-blocks' ) ) ); ?>
							</a>
						</li>
					</ul>
					<div class="x-dropdown-content-separator"></div>
					<ul role="menu">
						<li>
							<a role="menuitem" class="x-dropdown-link x-link" href="<?php echo esc_url( 'https://wpvip.com/?utm_source=WordPresscom&utm_medium=automattic_referral&utm_campaign=top_nav' ); ?>" title="<?php esc_attr_e( 'Enterprise', 'happy-blocks' ); ?>" tabindex="-1">
								<?php esc_html_e( 'Enterprise', 'happy-blocks' ); ?>
								<svg width="9" height="9" xmlns="http://www.w3.org/2000/svg" class="x-icon x-icon--external" role="img" aria-hidden="true" focusable="false">
									<path d="M5.5 0v1h1.795L2.38 5.915l.705.705L8 1.705V3.5h1V0H5.5zM8 8H1V1h3V0H1a1 1 0 00-1 1v7a1 1 0 001 1h7a1 1 0 001-1V5H8v3z"></path>
								</svg>
							</a>
						</li>
					</ul>
				</div>
				<div class="x-dropdown-content" data-dropdown-name="features" role="menu" aria-label="<?php esc_attr_e( 'Features', 'happy-blocks' ); ?>" aria-hidden="true">
					<ul role="menu">
						<li>
							<a role="menuitem" class="x-dropdown-link x-link" href="<?php echo esc_url( localized_wpcom_url( '//wordpress.com/features/' ) ); ?>" title="<?php esc_attr_e( 'Features', 'happy-blocks' ); ?>" tabindex="-1">
								<?php esc_html_e( 'Overview', 'happy-blocks' ); ?>
							</a>
						</li>
					</ul>
					<div class="x-dropdown-content-separator"></div>
					<ul role="menu">
						<li>
							<a role="menuitem" class="x-dropdown-link x-link" href="<?php echo esc_url( localized_wpcom_url( '//wordpress.com/themes' ) ); ?>" title="<?php echo esc_attr( fixme__( 'WordPress Themes', __( 'Themes', 'happy-blocks' ) ) ); ?>" tabindex="-1">
								<?php echo esc_html( fixme__( 'WordPress Themes', __( 'Themes', 'happy-blocks' ) ) ); ?>
							</a>
						</li>
						<li>
							<a role="menuitem" class="x-dropdown-link x-link" href="<?php echo esc_url( localized_wpcom_url( '//wordpress.com/plugins' ) ); ?>" title="<?php echo esc_attr( fixme__( 'WordPress Plugins', __( 'Plugins', 'happy-blocks' ) ) ); ?>" tabindex="-1">
								<?php echo esc_html( fixme__( 'WordPress Plugins', __( 'Plugins', 'happy-blocks' ) ) ); ?>
							</a>
						</li>
						<li>
							<a role="menuitem" class="x-dropdown-link x-link" href="<?php echo esc_url( localized_wpcom_url( '//wordpress.com/google/' ) ); ?>" title="<?php esc_html_e( 'Google Apps', 'happy-blocks' ); ?>" tabindex="-1">
								<?php esc_html_e( 'Google Apps', 'happy-blocks' ); ?>
							</a>
						</li>
					</ul>
				</div>
				<div class="x-dropdown-content" data-dropdown-name="resources" role="menu" aria-label="<?php esc_attr_e( 'Resources', 'happy-blocks' ); ?>" aria-hidden="true">
					<ul role="menu">
						<li>
							<a role="menuitem" class="x-dropdown-link x-link" href="<?php echo esc_url( localized_wpcom_url( '//wordpress.com/support/' ) ); ?>" title="<?php esc_attr_e( 'Support', 'happy-blocks' ); ?>" tabindex="-1">
								<?php echo esc_html( fixme__( 'WordPress.com Support', __( 'Support', 'happy-blocks' ) ) ); ?>
							</a>
						</li>
						<li>
							<a role="menuitem" class="x-dropdown-link x-link" href="<?php echo esc_url( localized_wpcom_url( '//wordpress.com/blog/' ) ); ?>" title="<?php esc_attr_e( 'News', 'happy-blocks' ); ?>" tabindex="-1">
								<?php esc_html_e( 'News', 'happy-blocks' ); ?>
							</a>
						</li>
						<li>
							<a role="menuitem" class="x-dropdown-link x-link" href="<?php echo esc_url( localized_wpcom_url( '//wordpress.com/go/' ) ); ?>" title="<?php echo esc_attr( fixme__( 'Website Building Tips', __( 'Expert Tips', 'happy-blocks' ) ) ); ?>" tabindex="-1">
								<?php echo esc_html( fixme__( 'Website Building Tips', __( 'Expert Tips', 'happy-blocks' ) ) ); ?>
							</a>
						</li>
						<li>
							<a role="menuitem" class="x-dropdown-link x-link" href="<?php echo esc_url( localized_wpcom_url( '//wordpress.com/business-name-generator/' ) ); ?>" title="<?php esc_attr_e( 'Business Name Generator', 'happy-blocks' ); ?>" tabindex="-1">
								<?php esc_html_e( 'Business Name Generator', 'happy-blocks' ); ?>
							</a>
						</li>
						<li>
							<a role="menuitem" class="x-dropdown-link x-link" href="<?php echo esc_url( localized_wpcom_url( '//wordpress.com/logo-maker/' ) ); ?>" title="<?php esc_attr_e( 'Logo Maker', 'happy-blocks' ); ?>" tabindex="-1">
								<?php esc_html_e( 'Logo Maker', 'happy-blocks' ); ?>
							</a>
						</li>
						<?php if ( time() >= strtotime( '2021-02-17' ) ) : ?>
							<li>
								<a role="menuitem" class="x-dropdown-link x-link" href="<?php echo esc_url( localized_wpcom_url( '//wordpress.com/webinars/' ) ); ?>" title="<?php esc_attr_e( 'Daily Webinars', 'happy-blocks' ); ?>" tabindex="-1">
									<?php esc_html_e( 'Daily Webinars', 'happy-blocks' ); ?>
								</a>
							</li>
							<li>
								<a role="menuitem" class="x-dropdown-link x-link" href="<?php echo esc_url( '//wordpress.com/learn/' ); ?>" title="<?php echo esc_attr( __( 'Learn WordPress', 'happy-blocks' ) ); ?>" tabindex="-1">
									<?php esc_html_e( 'Learn WordPress', 'happy-blocks' ); ?>
								</a>
							</li>
						<?php endif; ?>
					</ul>
				</div>
			</div>
			<!-- Desktop dropdowns end here. -->

			<!-- Mobile menu starts here. -->
			<div class="x-menu" role="menu" aria-label="<?php esc_attr_e( 'WordPress.com Navigation Menu', 'happy-blocks' ); ?>" aria-hidden="true">
				<div class="x-menu-overlay"></div>
				<div class="x-menu-content">
					<button class="x-menu-button x-link" tabindex="-1">
						<span class="x-hidden"><?php esc_html_e( 'Close the navigation menu', 'happy-blocks' ); ?></span>
						<span class="x-icon x-icon--close">
							<span></span>
							<span></span>
						</span>
					</button>
					<div class="x-menu-list">
						<div class="x-menu-list-title">
							<?php esc_html_e( 'Get Started', 'happy-blocks' ); ?>
						</div>
						<ul class="x-menu-grid mob-signup" role="menu">
							<li class="x-menu-grid-item">
								<a role="menuitem" class="x-menu-link x-link" href="<?php echo esc_url( localized_wpcom_url( 'https://wordpress.com/start/' ) ); ?>" title="<?php esc_attr_e( 'Sign Up', 'happy-blocks' ); ?>" tabindex="-1">
									<?php esc_html_e( 'Sign Up', 'happy-blocks' ); ?> <span class="x-menu-link-chevron" aria-hidden="true"></span>
								</a>
							</li>
							<li class="x-menu-grid-item">
								<a role="menuitem" class="x-menu-link x-link" href="<?php echo esc_url( localized_wpcom_url( '//wordpress.com/log-in/' ) ); ?>" title="<?php esc_attr_e( 'Log In', 'happy-blocks' ); ?>" tabindex="-1">
									<?php esc_html_e( 'Log In', 'happy-blocks' ); ?> <span class="x-menu-link-chevron" aria-hidden="true"></span>
								</a>
							</li>
						</ul>
					</div>
					<div class="x-menu-list">
						<div class="x-hidden">
							<?php esc_html_e( 'About', 'happy-blocks' ); ?>
						</div>
						<ul class="x-menu-grid" role="menu">
							<li class="x-menu-grid-item">
								<a role="menuitem" class="x-menu-link x-link" href="<?php echo esc_url( localized_wpcom_url( '//wordpress.com/pricing/' ) ); ?>" title="<?php esc_attr_e( 'Plans &amp; Pricing', 'happy-blocks' ); ?>" tabindex="-1">
									<?php esc_html_e( 'Plans &amp; Pricing', 'happy-blocks' ); ?>
								</a>
							</li>
						</ul>
					</div>
					<div class="x-menu-list">
						<div class="x-menu-list-title">
							<?php esc_html_e( 'Products', 'happy-blocks' ); ?>
						</div>
						<ul class="x-menu-grid" role="menu">
							<li class="x-menu-grid-item">
								<a role="menuitem" class="x-menu-link x-link" href="<?php echo esc_url( localized_wpcom_url( '//wordpress.com/hosting/' ) ); ?>" title="<?php echo esc_attr( fixme__( 'WordPress Hosting', __( 'Hosting', 'happy-blocks' ) ) ); ?>" tabindex="-1">
									<?php echo esc_html( fixme__( 'WordPress Hosting', __( 'Hosting', 'happy-blocks' ) ) ); ?>
								</a>
							</li>
							<li class="x-menu-grid-item">
								<a role="menuitem" class="x-menu-link x-link" href="<?php echo esc_url( localized_wpcom_url( '//wordpress.com/domains/' ) ); ?>" title="<?php echo esc_attr( fixme__( 'Domain Names', __( 'Domains', 'happy-blocks' ) ) ); ?>" tabindex="-1">
									<?php echo esc_html( fixme__( 'Domain Names', __( 'Domains', 'happy-blocks' ) ) ); ?>
								</a>
							</li>
							<li class="x-menu-grid-item">
								<a role="menuitem" class="x-menu-link x-link" href="<?php echo esc_url( localized_wpcom_url( '//wordpress.com/website-builder/' ) ); ?>" title="<?php esc_attr_e( 'Website Builder', 'happy-blocks' ); ?>" tabindex="-1">
									<?php esc_html_e( 'Website Builder', 'happy-blocks' ); ?>
								</a>
							</li>
							<li class="x-menu-grid-item">
								<a role="menuitem" class="x-menu-link x-link" href="<?php echo esc_url( localized_wpcom_url( '//wordpress.com/create-blog/' ) ); ?>" title="<?php echo esc_attr( fixme__( 'Create a Blog', __( 'Blogs', 'happy-blocks' ) ) ); ?>" tabindex="-1">
									<?php echo esc_html( fixme__( 'Create a Blog', __( 'Blogs', 'happy-blocks' ) ) ); ?>
								</a>
							</li>
							<li class="x-menu-grid-item">
								<a role="menuitem" class="x-menu-link x-link" href="<?php echo esc_url( localized_wpcom_url( '//wordpress.com/professional-email/' ) ); ?>" title="<?php echo esc_attr( fixme__( 'Professional Email', __( 'Email', 'happy-blocks' ) ) ); ?>" tabindex="-1">
									<?php echo esc_html( fixme__( 'Professional Email', __( 'Email', 'happy-blocks' ) ) ); ?>
								</a>
							</li>
							<li class="x-menu-grid-item">
								<a role="menuitem" class="x-menu-link x-link" href="<?php echo esc_url( 'https://wpvip.com/?utm_source=WordPresscom&utm_medium=automattic_referral&utm_campaign=top_nav' ); ?>" title="<?php esc_attr_e( 'Enterprise', 'happy-blocks' ); ?>" tabindex="-1">
									<?php esc_html_e( 'Enterprise', 'happy-blocks' ); ?>
									<svg width="9" height="9" xmlns="http://www.w3.org/2000/svg" class="x-icon x-icon--external" role="img" aria-hidden="true" focusable="false">
										<path d="M5.5 0v1h1.795L2.38 5.915l.705.705L8 1.705V3.5h1V0H5.5zM8 8H1V1h3V0H1a1 1 0 00-1 1v7a1 1 0 001 1h7a1 1 0 001-1V5H8v3z"></path>
									</svg>
								</a>
							</li>
						</ul>
					</div>
					<div class="x-menu-list">
						<div class="x-menu-list-title">
							<?php esc_html_e( 'Features', 'happy-blocks' ); ?>
						</div>
						<ul class="x-menu-grid" role="menu">
							<li class="x-menu-grid-item">
								<a role="menuitem" class="x-menu-link x-link" href="<?php echo esc_url( localized_wpcom_url( '//wordpress.com/features/' ) ); ?>" title="<?php esc_attr_e( 'Features', 'happy-blocks' ); ?>" tabindex="-1">
									<?php esc_html_e( 'Overview', 'happy-blocks' ); ?>
								</a>
							</li>
						</ul>
						<ul class="x-menu-grid" role="menu">
							<li class="x-menu-grid-item">
								<a role="menuitem" class="x-menu-link x-link" href="<?php echo esc_url( localized_wpcom_url( '//wordpress.com/themes' ) ); ?>" title="<?php echo esc_attr( fixme__( 'WordPress Themes', __( 'Themes', 'happy-blocks' ) ) ); ?>" tabindex="-1">
									<?php echo esc_html( fixme__( 'WordPress Themes', __( 'Themes', 'happy-blocks' ) ) ); ?>
								</a>
							</li>
							<li class="x-menu-grid-item">
								<a role="menuitem" class="x-menu-link x-link" href="<?php echo esc_url( localized_wpcom_url( '//wordpress.com/plugins' ) ); ?>" title="<?php echo esc_attr( fixme__( 'WordPress Plugins', __( 'Plugins', 'happy-blocks' ) ) ); ?>" tabindex="-1">
									<?php echo esc_html( fixme__( 'WordPress Plugins', __( 'Plugins', 'happy-blocks' ) ) ); ?>
								</a>
							</li>
							<li class="x-menu-grid-item">
								<a role="menuitem" class="x-menu-link x-link" href="<?php echo esc_url( localized_wpcom_url( '//wordpress.com/google/' ) ); ?>" title="<?php esc_attr_e( 'Google Apps', 'happy-blocks' ); ?>" tabindex="-1">
									<?php esc_html_e( 'Google Apps', 'happy-blocks' ); ?>
								</a>
							</li>
						</ul>
					</div>
					<div class="x-menu-list">
						<div class="x-menu-list-title">
							<?php esc_html_e( 'Resources', 'happy-blocks' ); ?>
						</div>
						<ul class="x-menu-grid" role="menu">
							<li class="x-menu-grid-item">
								<a role="menuitem" class="x-menu-link x-link" href="<?php echo esc_url( localized_wpcom_url( '//wordpress.com/support/' ) ); ?>" title="<?php esc_attr_e( 'Support', 'happy-blocks' ); ?>" tabindex="-1">
									<?php echo esc_html( fixme__( 'WordPress.com Support', __( 'Support', 'happy-blocks' ) ) ); ?>
								</a>
							</li>
							<li class="x-menu-grid-item">
								<a role="menuitem" class="x-menu-link x-link" href="<?php echo esc_url( localized_wpcom_url( '//wordpress.com/blog/' ) ); ?>" title="<?php esc_attr_e( 'News', 'happy-blocks' ); ?>" tabindex="-1">
									<?php esc_html_e( 'News', 'happy-blocks' ); ?>
								</a>
							</li>
							<li class="x-menu-grid-item">
								<a role="menuitem" class="x-menu-link x-link" href="<?php echo esc_url( localized_wpcom_url( '//wordpress.com/go/' ) ); ?>" title="<?php echo esc_attr( fixme__( 'Website Building Tips', __( 'Expert Tips', 'happy-blocks' ) ) ); ?>" tabindex="-1">
									<?php echo esc_html( fixme__( 'Website Building Tips', __( 'Expert Tips', 'happy-blocks' ) ) ); ?>
								</a>
							</li>
							<li class="x-menu-grid-item">
								<a role="menuitem" class="x-menu-link x-link" href="<?php echo esc_url( localized_wpcom_url( '//wordpress.com/business-name-generator/' ) ); ?>" title="<?php esc_attr_e( 'Business Name Generator', 'happy-blocks' ); ?>" tabindex="-1">
									<?php esc_html_e( 'Business Name Generator', 'happy-blocks' ); ?>
								</a>
							</li>
							<li class="x-menu-grid-item">
								<a role="menuitem" class="x-menu-link x-link" href="<?php echo esc_url( localized_wpcom_url( '//wordpress.com/logo-maker/' ) ); ?>" title="<?php esc_attr_e( 'Logo Maker', 'happy-blocks' ); ?>" tabindex="-1">
									<?php esc_html_e( 'Logo Maker', 'happy-blocks' ); ?>
								</a>
							</li>
							<?php if ( time() >= strtotime( '2021-02-17' ) ) : ?>
								<li class="x-menu-grid-item">
									<a role="menuitem" class="x-menu-link x-link" href="<?php echo esc_url( localized_wpcom_url( '//wordpress.com/webinars/' ) ); ?>" title="<?php esc_attr_e( 'Daily Webinars', 'happy-blocks' ); ?>" tabindex="-1">
										<?php esc_html_e( 'Daily Webinars', 'happy-blocks' ); ?>
									</a>
								</li>
								<li class="x-menu-grid-item">
									<a role="menuitem" class="x-menu-link x-link" href="<?php echo esc_url( '//wordpress.com/learn/' ); ?>" title="<?php echo esc_attr( __( 'Learn WordPress', 'happy-blocks' ) ); ?>" tabindex="-1">
										<?php esc_html_e( 'Learn WordPress', 'happy-blocks' ); ?>
									</a>
								</li>
							<?php endif; ?>
						</ul>
					</div>
				</div>
			</div>
			<!-- Mobile menu ends here. -->

		</div>
	</div>
</div>
<div class="happy-blocks-mini-search">
	<div class="happy-blocks-search-container">
			<div class="happy-blocks-global-header__top">
				<div class="happy-blocks-global-header__tabs">
					<?php foreach ( $happy_blocks_tabs as $key => $happy_blocks_tab ) { ?>
							<a href="<?php echo esc_attr( $happy_blocks_tab['url'] ); ?>" class="happy-blocks-global-header__tab<?php echo $happy_blocks_current_tab === $key ? ' active' : ''; ?>"><?php echo esc_html( $happy_blocks_tab['title'] ); ?></a>
					<?php } ?>
				</div>
				<form role="search" method="get" action=""><label for="wp-block-search__input-1" class="screen-reader-text"><?php echo esc_html( $args['search_placeholder'] ); ?></label><div class="happy-blocks-search__inside-wrapper"><input type="search" id="wp-block-search__input-1" name="s" value="" placeholder="<?php echo esc_html( $args['search_placeholder'] ); ?>"></div></form>
			</div>
			<?php if ( $args['include_site_title'] ) : ?>
			<div class="happy-blocks-global-header-site__title">
				<h1><?php echo esc_html( $args['site_title'] ); ?></h1>
				<p><?php echo esc_html( $args['site_tagline'] ); ?></p>
			</div>
			<?php endif; ?>
	</div>
</div>
