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
		'url'   => 'https://wordpress.com/learn/',
	),
	'support' => array(
		'title' => __( 'Support', 'happy-blocks' ),
		'url'   => localized_wpcom_url( 'https://wordpress.com/support/' ),
	),
	'forums'  => array(
		'title' => __( 'Forums', 'happy-blocks' ),
		'url'   => localized_wpcom_url( 'https://wordpress.com/forums/' ),
	),
)
?>
<?php if ( ! is_user_logged_in() ) : ?>
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
									<svg width="141" height="24" viewBox="0 0 141 24" fill="none" xmlns="http://www.w3.org/2000/svg" role="banner" aria-hidden="true" focusable="false">
										<path fill-rule="evenodd" clip-rule="evenodd" d="M16.5781 21.2595L19.713 12.1757C20.2989 10.7082 20.4938 9.53487 20.4938 8.49149C20.4938 8.11267 20.4689 7.7612 20.4246 7.43359C21.2259 8.89863 21.6819 10.5799 21.6819 12.3685C21.6819 16.1632 19.6298 19.4767 16.5781 21.2595ZM12.8309 7.54535C13.4488 7.51284 14.0056 7.44768 14.0056 7.44768C14.5586 7.38224 14.4936 6.56754 13.9403 6.60005C13.9403 6.60005 12.2777 6.73079 11.2044 6.73079C10.1957 6.73079 8.50096 6.60005 8.50096 6.60005C7.94752 6.56754 7.88263 7.41489 8.43608 7.44768C8.43608 7.44768 8.95958 7.51284 9.51247 7.54535L11.1115 11.9364L8.86477 18.6874L5.1274 7.54535C5.74586 7.51284 6.30195 7.44768 6.30195 7.44768C6.85497 7.38224 6.78954 6.56754 6.23637 6.60005C6.23637 6.60005 4.5741 6.73079 3.50077 6.73079C3.30835 6.73079 3.08127 6.7259 2.83984 6.71823C4.67546 3.92602 7.83014 2.08203 11.4162 2.08203C14.0884 2.08203 16.5216 3.10588 18.3476 4.78271C18.3036 4.77992 18.2602 4.77434 18.2148 4.77434C17.2063 4.77434 16.491 5.65448 16.491 6.60005C16.491 7.44768 16.979 8.16471 17.4993 9.01261C17.8895 9.69769 18.3454 10.5777 18.3454 11.8492C18.3454 12.73 18.0849 13.8379 17.5644 15.1748L16.5404 18.6029L12.8309 7.54535ZM11.4172 22.6551C10.4097 22.6551 9.4372 22.5066 8.51758 22.2361L11.5976 13.2676L14.7525 21.93C14.7732 21.9805 14.7985 22.0271 14.826 22.0716C13.759 22.4476 12.6126 22.6551 11.4172 22.6551ZM1.15255 12.37C1.15255 10.8786 1.4718 9.46265 2.04153 8.18361L6.93771 21.6274C3.5132 19.9604 1.15255 16.4418 1.15255 12.37ZM11.4165 0.927734C5.12159 0.927734 0 6.05995 0 12.3684C0 18.6774 5.12159 23.8101 11.4165 23.8101C17.7115 23.8101 22.8332 18.6774 22.8332 12.3684C22.8332 6.05995 17.7115 0.927734 11.4165 0.927734Z" fill="#101517"/>
										<path fill-rule="evenodd" clip-rule="evenodd" d="M40.4345 7.46875L38.1581 16.234L35.882 7.46875H33.5841L34.1192 9.3472L32.1154 16.5306L29.9362 7.46875H27.7266L30.8328 18.9165H33.2405L35.1012 12.7962L36.8442 18.9165H39.2522L42.5126 7.46875H40.4345ZM106.625 18.9163H108.644V16.832H106.625V18.9163ZM46.3499 10.5977C43.5709 10.5977 42.2578 12.392 42.2578 14.8694C42.2578 17.347 43.5709 19.1243 46.3499 19.1243C49.1121 19.1243 50.4421 17.347 50.4421 14.8694C50.4421 12.392 49.1121 10.5977 46.3499 10.5977ZM46.3477 17.4993C45.0347 17.4993 44.3359 16.6451 44.3359 14.8678C44.3359 13.108 45.0347 12.2363 46.3477 12.2363C47.6606 12.2363 48.3429 13.0909 48.3429 14.8678C48.3429 16.6281 47.6606 17.4993 46.3477 17.4993ZM63.6071 10.7834C63.0102 10.6641 62.5841 10.5955 62.0896 10.5955C59.3105 10.5955 57.793 12.458 57.793 15.1749C57.793 17.8744 59.3105 19.1221 61.1008 19.1221C61.9876 19.1221 63.0615 18.7117 63.7095 18.1651V18.9167H65.6189V7.46894H63.6071V10.7834ZM63.6071 16.5753C62.9594 17.1731 62.3454 17.498 61.6977 17.498C60.5891 17.498 59.873 16.7629 59.873 15.0374C59.873 13.1749 60.7597 12.2011 62.2944 12.2011C62.7715 12.2011 63.2662 12.3205 63.6071 12.4573V16.5753ZM71.8338 7.46875H68.1074V18.9165H70.2559V14.9354H71.8338C74.2721 14.9354 76.0456 13.6197 76.0456 11.1594C76.0456 8.68138 74.2721 7.46875 71.8338 7.46875ZM71.853 13.2588H70.2578V9.1582H71.853C73.1489 9.1582 73.7971 9.87565 73.7971 11.1573C73.7971 12.4215 73.2003 13.2588 71.853 13.2588ZM86.9736 10.5977C84.3821 10.5977 83.0352 12.6141 83.0352 14.8181C83.0352 17.8427 84.6202 19.1243 87.1923 19.1243C88.2322 19.1243 89.1308 18.9856 90.1795 18.6627V16.9862C89.3349 17.2966 88.5731 17.4836 87.7548 17.4836C86.255 17.4836 85.2517 17.0737 85.2003 15.2965H90.3836C90.4181 14.9721 90.4521 14.6646 90.4521 14.1008C90.4521 12.392 89.5485 10.5977 86.9736 10.5977ZM85.2168 13.9606C85.3361 12.8328 85.9498 12.1152 86.9555 12.1152C88.0301 12.1152 88.3539 12.9698 88.3539 13.9606H85.2168ZM93.9452 13.0755C93.9452 12.4602 94.6106 12.2213 95.3262 12.2213C96.4811 12.2213 97.5767 12.5798 97.5767 12.5798V10.9052C96.8269 10.6832 96.0594 10.5977 95.1731 10.5977C93.2291 10.5977 91.8652 11.5203 91.8652 13.0239C91.8652 15.9459 95.8891 15.1944 95.8891 16.6124C95.8891 17.3129 95.2581 17.5009 94.3375 17.5009C93.6894 17.5009 92.6497 17.2475 91.8995 16.9862V18.6438C92.5241 18.89 93.3996 19.1243 94.2693 19.1243C96.1618 19.1243 97.9692 18.5602 97.9692 16.527C97.9692 13.7076 93.9452 14.4423 93.9452 13.0755ZM121.867 10.5977C119.088 10.5977 117.775 12.392 117.775 14.8694C117.775 17.347 119.088 19.1243 121.867 19.1243C124.63 19.1243 125.96 17.347 125.96 14.8694C125.96 12.392 124.63 10.5977 121.867 10.5977ZM121.867 17.4993C120.554 17.4993 119.855 16.6451 119.855 14.8678C119.855 13.108 120.554 12.2363 121.867 12.2363C123.18 12.2363 123.862 13.0909 123.862 14.8678C123.862 16.6281 123.18 17.4993 121.867 17.4993ZM137.471 10.5977C136.602 10.5977 135.613 11.0761 134.709 11.6742L134.47 11.8281C134.044 10.9225 133.191 10.5977 132.254 10.5977C131.384 10.5977 130.395 11.0422 129.492 11.6402V10.8029H127.582V18.9189H129.611V13.0925C130.361 12.5971 131.162 12.2896 131.742 12.2896C132.407 12.2896 132.816 12.6481 132.816 13.7932V18.9189H134.829V13.1096C135.579 12.6141 136.38 12.2896 136.96 12.2896C137.625 12.2896 138.034 12.6481 138.034 13.7932V18.9189H140.046V13.3148C140.046 11.7425 139.108 10.5977 137.471 10.5977ZM79.2483 12.1345H79.1803V10.8018H77.3047V18.9178H79.3164V14.0823C79.9473 12.8864 80.7146 12.4934 81.9933 12.4934H82.1978V10.7335C82.1978 10.7335 81.9082 10.6992 81.6522 10.6992C80.5613 10.6992 79.8108 11.1263 79.2483 12.1345ZM54.0064 12.1345H53.9384V10.8017H52.0625V18.9177H54.0747V14.0823C54.7054 12.8864 55.4727 12.4933 56.7514 12.4933H56.9562V10.7335C56.9562 10.7335 56.666 10.6991 56.4107 10.6991C55.3191 10.6991 54.5691 11.1262 54.0064 12.1345ZM111.879 14.7842C111.879 12.8876 112.919 12.2379 114.146 12.2379C114.965 12.2379 115.826 12.4775 116.405 12.6995V10.9908C115.723 10.7686 115.118 10.5977 114.112 10.5977C111.435 10.5977 109.781 12.2379 109.781 14.8864C109.781 17.3982 110.975 19.1243 113.993 19.1243C114.947 19.1243 115.689 18.9362 116.507 18.6627V16.9881C115.586 17.347 114.879 17.4836 114.249 17.4836C112.919 17.4836 111.879 16.8686 111.879 14.7842ZM101.27 13.0755C101.27 12.4602 101.935 12.2213 102.651 12.2213C103.806 12.2213 104.902 12.5798 104.902 12.5798V10.9052C104.151 10.6832 103.384 10.5977 102.497 10.5977C100.554 10.5977 99.1895 11.5203 99.1895 13.0239C99.1895 15.9459 103.213 15.1944 103.213 16.6124C103.213 17.3129 102.582 17.5009 101.662 17.5009C101.014 17.5009 99.9742 17.2475 99.2238 16.9862V18.6438C99.8487 18.89 100.724 19.1243 101.594 19.1243C103.487 19.1243 105.293 18.5602 105.293 16.527C105.293 13.7076 101.27 14.4423 101.27 13.0755Z" fill="#101517"/>
									</svg>
									<span class="x-hidden"><?php esc_html_e( 'WordPress.com', 'happy-blocks' ); ?></span>
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
<?php endif; ?>
<div class="happy-blocks-mini-search">
	<div class="happy-blocks-search-container">
			<div class="happy-blocks-global-header__top">
				<div class="happy-blocks-global-header__tabs">
					<?php foreach ( $happy_blocks_tabs as $key => $happy_blocks_tab ) { ?>
							<a href="<?php echo esc_attr( $happy_blocks_tab['url'] ); ?>" class="happy-blocks-global-header__tab<?php echo $happy_blocks_current_tab === $key ? ' active' : ''; ?>"><?php echo esc_html( $happy_blocks_tab['title'] ); ?></a>
					<?php } ?>
				</div>
			</div>
			<hr />
			<?php if ( $args['include_site_title'] ) : ?>
			<div class="happy-blocks-global-header-site__title">
				<div class="happy-blocks-global-header-site__title__wrapper">
					<h1><?php echo esc_html( $args['site_title'] ); ?></h1>
					<p><?php echo esc_html( $args['site_tagline'] ); ?></p>
				</div>
				<form role="search" method="get" action=""><label for="wp-block-search__input-1" class="screen-reader-text"><?php echo esc_html( $args['search_placeholder'] ); ?></label><div class="happy-blocks-search__inside-wrapper"><input type="search" id="wp-block-search__input-1" name="s" value="" placeholder="<?php echo esc_html( $args['search_placeholder'] ); ?>"></div></form>
			</div>
			<?php endif; ?>
	</div>
</div>
