<?php
/**
 * Title: WordPress main navbar
 * Slug: happy-blocks/wpcom-navbar
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
$website_clasname = '';
if ( isset( $args['website'] ) ) {
	$website_clasname = 'is-' . $args['website'];
}

?>
<div id="lpc-header-nav" class="lpc lpc-header-nav <?php echo esc_attr( $website_clasname ); ?>">
	<div class="x-root lpc-header-nav-wrapper">
		<div class="lpc-header-nav-container">
			<!-- Nav bar starts here. -->
			<div class="masterbar-menu">
				<div class="masterbar">
					<nav class="x-nav" aria-label="<?php esc_attr_e( 'WordPress.com Navigation', 'happy-blocks' ); ?>">
						<ul class="x-nav-list x-nav-list--left" role="menu">
							<li class="x-nav-item" role="menuitem">
								<a class="x-nav-link x-nav-link--logo x-link"
									href="<?php echo esc_url( localized_wpcom_url( '//wordpress.com/' ) ); ?>">
									<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 170 36"
										class="x-icon x-icon--logo">
										<path
											d="M47.57 10l-2.79 10.72L41.99 10h-2.81l.65 2.3-2.45 8.78L34.7 10H32l3.8 14h2.96l2.28-7.49L43.17 24h2.95l4-14h-2.55zm28.39 4.06a9 9 0 0 0-1.86-.23c-3.4 0-5.26 2.27-5.26 5.6 0 3.31 1.86 4.82 4.05 4.82a5.45 5.45 0 0 0 3.2-1.17V24h2.33V10h-2.46v4.06zm0 7.08c-.8.73-1.55 1.13-2.34 1.13-1.36 0-2.23-.9-2.23-3.01 0-2.28 1.08-3.47 2.96-3.47.55 0 1.1.11 1.6.31v5.04zM64.2 15.7h-.09v-1.64h-2.3V24h2.47v-5.92c.77-1.46 1.71-1.94 3.28-1.94h.25V14a6.67 6.67 0 0 0-.67-.04c-1.34 0-2.26.52-2.94 1.75zm83.14-1.89c-3.4 0-5.01 2.2-5.01 5.23 0 3.02 1.6 5.2 5.01 5.2s5.01-2.18 5.01-5.2c0-3.03-1.63-5.23-5.02-5.23h.01zm0 8.44c-1.6 0-2.46-1.04-2.46-3.21 0-2.18.85-3.22 2.46-3.22 1.6 0 2.44 1.04 2.44 3.22 0 2.17-.84 3.21-2.45 3.21h.01zm19.12-8.44c-1.06 0-2.28.58-3.38 1.32l-.3.19c-.51-1.11-1.56-1.5-2.71-1.5-1.06 0-2.27.54-3.38 1.27v-1.03h-2.34V24h2.48v-7.13a5.3 5.3 0 0 1 2.61-.98c.81 0 1.32.44 1.32 1.84V24h2.46v-7.1c.92-.6 1.9-1 2.6-1 .82 0 1.32.43 1.32 1.84V24h2.46v-6.86c0-1.92-1.14-3.32-3.15-3.32zm-111.64 0c-3.4 0-5 2.2-5 5.23 0 3.02 1.6 5.2 5 5.2s5.02-2.18 5.02-5.2c0-3.03-1.64-5.23-5.03-5.23h.01zm0 8.44c-1.6 0-2.46-1.04-2.46-3.21 0-2.18.86-3.22 2.47-3.22 1.6 0 2.44 1.04 2.44 3.22 0 2.17-.85 3.21-2.46 3.21h.01zm40.31-6.56h-.08v-1.63h-2.31V24h2.46v-5.92c.77-1.46 1.71-1.94 3.28-1.94h.25V14a6.67 6.67 0 0 0-.67-.04c-1.33 0-2.25.52-2.94 1.75h.01zM86.05 10h-4.58v14h2.64v-4.87h1.93c2.99 0 5.16-1.61 5.16-4.62 0-3-2.17-4.51-5.16-4.51zm.02 7.08h-1.96v-5.01h1.95c1.6 0 2.38.88 2.38 2.44 0 1.57-.73 2.57-2.38 2.57h.01zm36.02-.23c0-.75.82-1.04 1.7-1.04.93.01 1.86.16 2.75.43V14.2a10.14 10.14 0 0 0-2.95-.38c-2.38 0-4.05 1.13-4.05 2.97 0 3.57 4.92 2.65 4.92 4.39 0 .85-.77 1.08-1.9 1.08-.8 0-2.07-.3-2.99-.63v2.03a8.29 8.29 0 0 0 2.9.59c2.32 0 4.53-.69 4.53-3.17.03-3.45-4.9-2.56-4.9-4.23zm-17.5-3.03c-3.18 0-4.83 2.47-4.83 5.16 0 3.7 1.94 5.27 5.1 5.27a11.81 11.81 0 0 0 3.65-.57v-2.05c-1.03.38-1.97.61-2.97.61-1.84 0-3.07-.5-3.13-2.67h6.36c.06-.49.09-.98.08-1.46 0-2.1-1.11-4.29-4.27-4.29zm-2.16 4.12c.15-1.38.9-2.26 2.13-2.26 1.32 0 1.72 1.05 1.72 2.26h-3.85zm10.7-1.09c0-.75.81-1.04 1.69-1.04.93.01 1.86.16 2.75.43V14.2a10.14 10.14 0 0 0-2.94-.38c-2.38 0-4.06 1.13-4.06 2.97 0 3.57 4.93 2.65 4.93 4.39 0 .85-.78 1.08-1.9 1.08-.8 0-2.07-.3-3-.63v2.03a8.28 8.28 0 0 0 2.9.59c2.32 0 4.54-.69 4.54-3.17.02-3.45-4.91-2.56-4.91-4.23zm21.97 2.1c0-2.33 1.27-3.12 2.78-3.12.94.03 1.88.22 2.76.57v-2.1a8.11 8.11 0 0 0-2.8-.48c-3.28 0-5.31 2-5.31 5.25 0 3.07 1.46 5.18 5.16 5.18 1.17 0 2.08-.23 3.08-.57v-2.04c-1.13.43-2 .6-2.77.6-1.63 0-2.9-.75-2.9-3.3zM128.66 24h2.47v-2.55h-2.47V24zM1.72 16c0 4.47 2.6 8.32 6.36 10.15L2.7 11.41A11.24 11.24 0 0 0 1.72 16zM13 27.28c1.31 0 2.57-.23 3.75-.64l-.08-.15-3.47-9.5-3.38 9.83c1 .3 2.07.46 3.18.46zm1.55-16.57l4.08 12.13 1.13-3.76c.48-1.56.85-2.68.85-3.65 0-1.4-.5-2.36-.92-3.1-.58-.94-1.11-1.73-1.11-2.65 0-1.04.78-2 1.9-2h.14A11.24 11.24 0 0 0 13 4.72 11.27 11.27 0 0 0 3.58 9.8l.72.02c1.18 0 3-.15 3-.15.62-.03.69.86.08.93 0 0-.61.08-1.3.11l4.12 12.22 2.47-7.4-1.76-4.82a20.13 20.13 0 0 1-1.18-.1c-.61-.04-.54-.97.07-.94 0 0 1.86.15 2.97.15 1.18 0 3-.15 3-.15.61-.03.69.86.08.93 0 0-.61.07-1.3.11zm4.12 15.04A11.28 11.28 0 0 0 24.28 16c0-1.96-.5-3.8-1.38-5.41a10.65 10.65 0 0 1-.78 5.2l-3.45 9.96zM13 29a13 13 0 1 1 0-26 13 13 0 0 1 0 26z"
											fill="inherit" fill-rule="nonzero"></path>
									</svg>
									<!-- <svg width="141" height="24" viewBox="0 0 141 24" fill="none" xmlns="http://www.w3.org/2000/svg" role="banner" aria-hidden="true" focusable="false">
									<path fill-rule="evenodd" clip-rule="evenodd" d="M16.5781 21.2595L19.713 12.1757C20.2989 10.7082 20.4938 9.53487 20.4938 8.49149C20.4938 8.11267 20.4689 7.7612 20.4246 7.43359C21.2259 8.89863 21.6819 10.5799 21.6819 12.3685C21.6819 16.1632 19.6298 19.4767 16.5781 21.2595ZM12.8309 7.54535C13.4488 7.51284 14.0056 7.44768 14.0056 7.44768C14.5586 7.38224 14.4936 6.56754 13.9403 6.60005C13.9403 6.60005 12.2777 6.73079 11.2044 6.73079C10.1957 6.73079 8.50096 6.60005 8.50096 6.60005C7.94752 6.56754 7.88263 7.41489 8.43608 7.44768C8.43608 7.44768 8.95958 7.51284 9.51247 7.54535L11.1115 11.9364L8.86477 18.6874L5.1274 7.54535C5.74586 7.51284 6.30195 7.44768 6.30195 7.44768C6.85497 7.38224 6.78954 6.56754 6.23637 6.60005C6.23637 6.60005 4.5741 6.73079 3.50077 6.73079C3.30835 6.73079 3.08127 6.7259 2.83984 6.71823C4.67546 3.92602 7.83014 2.08203 11.4162 2.08203C14.0884 2.08203 16.5216 3.10588 18.3476 4.78271C18.3036 4.77992 18.2602 4.77434 18.2148 4.77434C17.2063 4.77434 16.491 5.65448 16.491 6.60005C16.491 7.44768 16.979 8.16471 17.4993 9.01261C17.8895 9.69769 18.3454 10.5777 18.3454 11.8492C18.3454 12.73 18.0849 13.8379 17.5644 15.1748L16.5404 18.6029L12.8309 7.54535ZM11.4172 22.6551C10.4097 22.6551 9.4372 22.5066 8.51758 22.2361L11.5976 13.2676L14.7525 21.93C14.7732 21.9805 14.7985 22.0271 14.826 22.0716C13.759 22.4476 12.6126 22.6551 11.4172 22.6551ZM1.15255 12.37C1.15255 10.8786 1.4718 9.46265 2.04153 8.18361L6.93771 21.6274C3.5132 19.9604 1.15255 16.4418 1.15255 12.37ZM11.4165 0.927734C5.12159 0.927734 0 6.05995 0 12.3684C0 18.6774 5.12159 23.8101 11.4165 23.8101C17.7115 23.8101 22.8332 18.6774 22.8332 12.3684C22.8332 6.05995 17.7115 0.927734 11.4165 0.927734Z" fill="#101517"/>
									<path fill-rule="evenodd" clip-rule="evenodd" d="M40.4345 7.46875L38.1581 16.234L35.882 7.46875H33.5841L34.1192 9.3472L32.1154 16.5306L29.9362 7.46875H27.7266L30.8328 18.9165H33.2405L35.1012 12.7962L36.8442 18.9165H39.2522L42.5126 7.46875H40.4345ZM106.625 18.9163H108.644V16.832H106.625V18.9163ZM46.3499 10.5977C43.5709 10.5977 42.2578 12.392 42.2578 14.8694C42.2578 17.347 43.5709 19.1243 46.3499 19.1243C49.1121 19.1243 50.4421 17.347 50.4421 14.8694C50.4421 12.392 49.1121 10.5977 46.3499 10.5977ZM46.3477 17.4993C45.0347 17.4993 44.3359 16.6451 44.3359 14.8678C44.3359 13.108 45.0347 12.2363 46.3477 12.2363C47.6606 12.2363 48.3429 13.0909 48.3429 14.8678C48.3429 16.6281 47.6606 17.4993 46.3477 17.4993ZM63.6071 10.7834C63.0102 10.6641 62.5841 10.5955 62.0896 10.5955C59.3105 10.5955 57.793 12.458 57.793 15.1749C57.793 17.8744 59.3105 19.1221 61.1008 19.1221C61.9876 19.1221 63.0615 18.7117 63.7095 18.1651V18.9167H65.6189V7.46894H63.6071V10.7834ZM63.6071 16.5753C62.9594 17.1731 62.3454 17.498 61.6977 17.498C60.5891 17.498 59.873 16.7629 59.873 15.0374C59.873 13.1749 60.7597 12.2011 62.2944 12.2011C62.7715 12.2011 63.2662 12.3205 63.6071 12.4573V16.5753ZM71.8338 7.46875H68.1074V18.9165H70.2559V14.9354H71.8338C74.2721 14.9354 76.0456 13.6197 76.0456 11.1594C76.0456 8.68138 74.2721 7.46875 71.8338 7.46875ZM71.853 13.2588H70.2578V9.1582H71.853C73.1489 9.1582 73.7971 9.87565 73.7971 11.1573C73.7971 12.4215 73.2003 13.2588 71.853 13.2588ZM86.9736 10.5977C84.3821 10.5977 83.0352 12.6141 83.0352 14.8181C83.0352 17.8427 84.6202 19.1243 87.1923 19.1243C88.2322 19.1243 89.1308 18.9856 90.1795 18.6627V16.9862C89.3349 17.2966 88.5731 17.4836 87.7548 17.4836C86.255 17.4836 85.2517 17.0737 85.2003 15.2965H90.3836C90.4181 14.9721 90.4521 14.6646 90.4521 14.1008C90.4521 12.392 89.5485 10.5977 86.9736 10.5977ZM85.2168 13.9606C85.3361 12.8328 85.9498 12.1152 86.9555 12.1152C88.0301 12.1152 88.3539 12.9698 88.3539 13.9606H85.2168ZM93.9452 13.0755C93.9452 12.4602 94.6106 12.2213 95.3262 12.2213C96.4811 12.2213 97.5767 12.5798 97.5767 12.5798V10.9052C96.8269 10.6832 96.0594 10.5977 95.1731 10.5977C93.2291 10.5977 91.8652 11.5203 91.8652 13.0239C91.8652 15.9459 95.8891 15.1944 95.8891 16.6124C95.8891 17.3129 95.2581 17.5009 94.3375 17.5009C93.6894 17.5009 92.6497 17.2475 91.8995 16.9862V18.6438C92.5241 18.89 93.3996 19.1243 94.2693 19.1243C96.1618 19.1243 97.9692 18.5602 97.9692 16.527C97.9692 13.7076 93.9452 14.4423 93.9452 13.0755ZM121.867 10.5977C119.088 10.5977 117.775 12.392 117.775 14.8694C117.775 17.347 119.088 19.1243 121.867 19.1243C124.63 19.1243 125.96 17.347 125.96 14.8694C125.96 12.392 124.63 10.5977 121.867 10.5977ZM121.867 17.4993C120.554 17.4993 119.855 16.6451 119.855 14.8678C119.855 13.108 120.554 12.2363 121.867 12.2363C123.18 12.2363 123.862 13.0909 123.862 14.8678C123.862 16.6281 123.18 17.4993 121.867 17.4993ZM137.471 10.5977C136.602 10.5977 135.613 11.0761 134.709 11.6742L134.47 11.8281C134.044 10.9225 133.191 10.5977 132.254 10.5977C131.384 10.5977 130.395 11.0422 129.492 11.6402V10.8029H127.582V18.9189H129.611V13.0925C130.361 12.5971 131.162 12.2896 131.742 12.2896C132.407 12.2896 132.816 12.6481 132.816 13.7932V18.9189H134.829V13.1096C135.579 12.6141 136.38 12.2896 136.96 12.2896C137.625 12.2896 138.034 12.6481 138.034 13.7932V18.9189H140.046V13.3148C140.046 11.7425 139.108 10.5977 137.471 10.5977ZM79.2483 12.1345H79.1803V10.8018H77.3047V18.9178H79.3164V14.0823C79.9473 12.8864 80.7146 12.4934 81.9933 12.4934H82.1978V10.7335C82.1978 10.7335 81.9082 10.6992 81.6522 10.6992C80.5613 10.6992 79.8108 11.1263 79.2483 12.1345ZM54.0064 12.1345H53.9384V10.8017H52.0625V18.9177H54.0747V14.0823C54.7054 12.8864 55.4727 12.4933 56.7514 12.4933H56.9562V10.7335C56.9562 10.7335 56.666 10.6991 56.4107 10.6991C55.3191 10.6991 54.5691 11.1262 54.0064 12.1345ZM111.879 14.7842C111.879 12.8876 112.919 12.2379 114.146 12.2379C114.965 12.2379 115.826 12.4775 116.405 12.6995V10.9908C115.723 10.7686 115.118 10.5977 114.112 10.5977C111.435 10.5977 109.781 12.2379 109.781 14.8864C109.781 17.3982 110.975 19.1243 113.993 19.1243C114.947 19.1243 115.689 18.9362 116.507 18.6627V16.9881C115.586 17.347 114.879 17.4836 114.249 17.4836C112.919 17.4836 111.879 16.8686 111.879 14.7842ZM101.27 13.0755C101.27 12.4602 101.935 12.2213 102.651 12.2213C103.806 12.2213 104.902 12.5798 104.902 12.5798V10.9052C104.151 10.6832 103.384 10.5977 102.497 10.5977C100.554 10.5977 99.1895 11.5203 99.1895 13.0239C99.1895 15.9459 103.213 15.1944 103.213 16.6124C103.213 17.3129 102.582 17.5009 101.662 17.5009C101.014 17.5009 99.9742 17.2475 99.2238 16.9862V18.6438C99.8487 18.89 100.724 19.1243 101.594 19.1243C103.487 19.1243 105.293 18.5602 105.293 16.527C105.293 13.7076 101.27 14.4423 101.27 13.0755Z" fill="#101517"/>
								</svg> -->
									<span
										class="x-hidden"><?php esc_html_e( 'WordPress.com', 'happy-blocks' ); ?></span>
								</a>
							</li>
							<li class="x-nav-item x-nav-item--wide" role="menuitem">
								<button class="x-nav-link x-link" data-dropdown-trigger="products" aria-haspopup="true"
									aria-expanded="false">
									<?php esc_html_e( 'Products', 'happy-blocks' ); ?> <span class="x-nav-link-chevron"
										aria-hidden="true"></span>
								</button>
							</li>
							<li class="x-nav-item x-nav-item--wide" role="menuitem">
								<button class="x-nav-link x-link" data-dropdown-trigger="features" aria-haspopup="true"
									aria-expanded="false">
									<?php esc_html_e( 'Features', 'happy-blocks' ); ?> <span class="x-nav-link-chevron"
										aria-hidden="true"></span>
								</button>
							</li>
							<li class="x-nav-item x-nav-item--wide" role="menuitem">
								<button class="x-nav-link x-link" data-dropdown-trigger="resources" aria-haspopup="true"
									aria-expanded="false">
									<?php esc_html_e( 'Resources', 'happy-blocks' ); ?> <span class="x-nav-link-chevron"
										aria-hidden="true"></span>
								</button>
							</li>
							<li class="x-nav-item x-nav-item--wide" role="menuitem">
								<button class="x-nav-link x-link" data-dropdown-trigger="learn" aria-haspopup="true"
									aria-expanded="false">
									<?php esc_html_e( 'Learn', 'happy-blocks' ); ?> <span class="x-nav-link-chevron"
										aria-hidden="true"></span>
								</button>
							</li>
							<li class="x-nav-item x-nav-item--wide" role="menuitem">
								<a class="x-nav-link x-link"
									href="<?php echo esc_url( localized_wpcom_url( '//wordpress.com/pricing/' ) ); ?>">
									<?php esc_html_e( 'Plans &amp; Pricing', 'happy-blocks' ); ?>
								</a>
							</li>
						</ul>
						<ul class="x-nav-list x-nav-list--right" role="menu">
							<?php if ( ! is_user_logged_in() ) : ?>
							<li role="menuitem" class="x-nav-item x-nav-item--wide login-link">
								<a class="x-nav-link x-link"
									href="<?php echo esc_url( localized_wpcom_url( '//wordpress.com/log-in/' ) ); ?>">
								<?php esc_html_e( 'Log In', 'happy-blocks' ); ?>
								</a>
							</li>
							<?php endif; ?>
							<li role="menuitem" class="x-nav-item x-nav-item--wide get-started-btn">
								<a class="x-nav-link x-nav-link--primary x-link"
									href="<?php echo esc_url( localized_wpcom_url( 'https://wordpress.com/start/' ) ); ?>">
									<?php esc_html_e( 'Get Started', 'happy-blocks' ); ?>
								</a>
							</li>
							<li role="menuitem" class="x-nav-item x-nav-item--narrow">
								<button class="x-nav-link x-nav-link--menu x-link" aria-haspopup="true"
									aria-expanded="false">
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
				<div class="x-dropdown-content" data-dropdown-name="products" role="menu"
					aria-label="<?php esc_attr_e( 'Products', 'happy-blocks' ); ?>" aria-hidden="true">
					<ul role="menu">
						<li>
							<a role="menuitem" class="x-dropdown-link x-link"
								href="<?php echo esc_url( localized_wpcom_url( '//wordpress.com/hosting/' ) ); ?>"
								tabindex="-1">
								<?php echo esc_html( fixme__( 'WordPress Hosting', __( 'Hosting', 'happy-blocks' ) ) ); ?>
							</a>
						</li>
						<li>
							<a role="menuitem" class="x-dropdown-link x-link"
								href="<?php echo esc_url( localized_wpcom_url( '//wordpress.com/domains/' ) ); ?>"
								tabindex="-1">
								<?php echo esc_html( fixme__( 'Domain Names', __( 'Domains', 'happy-blocks' ) ) ); ?>
							</a>
						</li>
						<li>
							<a role="menuitem" class="x-dropdown-link x-link"
								href="<?php echo esc_url( localized_wpcom_url( '//wordpress.com/website-builder/' ) ); ?>"
								tabindex="-1">
								<?php esc_html_e( 'Website Builder', 'happy-blocks' ); ?>
							</a>
						</li>
						<li>
							<a role="menuitem" class="x-dropdown-link x-link"
								href="<?php echo esc_url( localized_wpcom_url( '//wordpress.com/create-blog/' ) ); ?>"
								tabindex="-1">
								<?php echo esc_html( fixme__( 'Create a Blog', __( 'Blogs', 'happy-blocks' ) ) ); ?>
							</a>
						</li>
						<li>
							<a role="menuitem" class="x-dropdown-link x-link"
								href="<?php echo esc_url( localized_wpcom_url( 'https://wordpress.com/newsletter/' ) ); ?>"
								tabindex="-1">
								<?php echo esc_html( __( 'Newsletter', 'happy-blocks' ) ); ?>
							</a>
						</li>
						<li>
							<a role="menuitem" class="x-dropdown-link x-link"
								href="<?php echo esc_url( localized_wpcom_url( '//wordpress.com/professional-email/' ) ); ?>"
								tabindex="-1">
								<?php echo esc_html( fixme__( 'Professional Email', __( 'Email', 'happy-blocks' ) ) ); ?>
							</a>
						</li>
						<li>
							<a role="menuitem" class="x-dropdown-link x-link"
								href="<?php echo esc_url( localized_wpcom_url( '//wordpress.com/website-design-service/' ) ); ?>"
								tabindex="-1">
								<?php echo esc_html( __( 'Website Design Services', 'happy-blocks' ) ); ?>
							</a>
						</li>
						<li>
							<a role="menuitem" class="x-dropdown-link x-link"
								href="<?php echo esc_url( localized_wpcom_url( '//wordpress.com/ecommerce/' ) ); ?>"
								tabindex="-1">
								<?php echo esc_html( __( 'Commerce', 'happy-blocks' ) ); ?>
							</a>
						</li>
					</ul>
					<div class="x-dropdown-content-separator"></div>
					<ul role="menu">
						<li>
							<a role="menuitem" class="x-dropdown-link x-link"
								href="<?php echo esc_url( 'https://wpvip.com/?utm_source=WordPresscom&utm_medium=automattic_referral&utm_campaign=top_nav' ); ?>"
								tabindex="-1">
								<?php esc_html_e( 'Enterprise', 'happy-blocks' ); ?>
								<svg width="9" height="9" xmlns="http://www.w3.org/2000/svg"
									class="x-icon x-icon--external" role="img" aria-hidden="true" focusable="false">
									<path
										d="M5.5 0v1h1.795L2.38 5.915l.705.705L8 1.705V3.5h1V0H5.5zM8 8H1V1h3V0H1a1 1 0 00-1 1v7a1 1 0 001 1h7a1 1 0 001-1V5H8v3z">
									</path>
								</svg>
							</a>
						</li>
					</ul>
				</div>
				<div class="x-dropdown-content" data-dropdown-name="features" role="menu"
					aria-label="<?php esc_attr_e( 'Features', 'happy-blocks' ); ?>" aria-hidden="true">
					<ul role="menu">
						<li>
							<a role="menuitem" class="x-dropdown-link x-link"
								href="<?php echo esc_url( localized_wpcom_url( 'https://wordpress.com/features/' ) ); ?>"
								tabindex="-1">
								<?php esc_html_e( 'Overview', 'happy-blocks' ); ?>
							</a>
						</li>
					</ul>
					<div class="x-dropdown-content-separator"></div>
					<ul role="menu">
						<li>
							<a role="menuitem" class="x-dropdown-link x-link"
								href="<?php echo esc_url( localized_wpcom_url( 'https://wordpress.com/themes' ) ); ?>"
								tabindex="-1">
								<?php echo esc_html( fixme__( 'WordPress Themes', __( 'Themes', 'happy-blocks' ) ) ); ?>
							</a>
						</li>
						<li>
							<a role="menuitem" class="x-dropdown-link x-link"
								href="<?php echo esc_url( localized_wpcom_url( 'https://wordpress.com/plugins' ) ); ?>"
								tabindex="-1">
								<?php echo esc_html( fixme__( 'WordPress Plugins', __( 'Plugins', 'happy-blocks' ) ) ); ?>
							</a>
						</li>
						<li>
							<a role="menuitem" class="x-dropdown-link x-link"
							   href="<?php echo esc_url( localized_wpcom_url( 'https://wordpress.com/patterns' ) ); ?>"
							   tabindex="-1">
								<?php echo esc_html( fixme__( 'WordPress Patterns', __( 'Patterns', 'happy-blocks' ) ) ); ?>
							</a>
						</li>
						<li>
							<a role="menuitem" class="x-dropdown-link x-link"
								href="<?php echo esc_url( localized_wpcom_url( 'https://wordpress.com/google/' ) ); ?>"
								tabindex="-1">
								<?php esc_html_e( 'Google Apps', 'happy-blocks' ); ?>
							</a>
						</li>
					</ul>
				</div>
				<div class="x-dropdown-content" data-dropdown-name="resources" role="menu"
					aria-label="<?php esc_attr_e( 'Resources', 'happy-blocks' ); ?>" aria-hidden="true">
					<ul role="menu">
						<li>
							<a role="menuitem" class="x-dropdown-link x-link"
								href="<?php echo esc_url( localized_wpcom_url( '//wordpress.com/blog/' ) ); ?>"
								tabindex="-1">
								<?php esc_html_e( 'News', 'happy-blocks' ); ?>
							</a>
						</li>
						<li>
							<a role="menuitem" class="x-dropdown-link x-link"
								href="<?php echo esc_url( localized_wpcom_url( '//wordpress.com/go/' ) ); ?>"
								tabindex="-1">
								<?php echo esc_html( fixme__( 'Website Building Tips', __( 'Expert Tips', 'happy-blocks' ) ) ); ?>
							</a>
						</li>
						<li>
							<a role="menuitem" class="x-dropdown-link x-link"
								href="<?php echo esc_url( localized_wpcom_url( '//wordpress.com/business-name-generator/' ) ); ?>"
								tabindex="-1">
								<?php esc_html_e( 'Business Name Generator', 'happy-blocks' ); ?>
							</a>
						</li>
						<li>
							<a role="menuitem" class="x-dropdown-link x-link"
								href="<?php echo esc_url( localized_wpcom_url( '//wordpress.com/logo-maker/' ) ); ?>"
								tabindex="-1">
								<?php esc_html_e( 'Logo Maker', 'happy-blocks' ); ?>
							</a>
						</li>
						<li>
							<a role="menuitem" class="x-dropdown-link x-link"
								href="<?php echo esc_url( localized_wpcom_url( '//wordpress.com/discover/' ) ); ?>"
								tabindex="-1">
							<?php esc_html_e( 'Discover New Posts', 'happy-blocks' ); ?>
							</a>
						</li>
						<li>
							<a role="menuitem" class="x-dropdown-link x-link"
								href="<?php echo esc_url( localized_wpcom_url( '//wordpress.com/tags/' ) ); ?>"
								tabindex="-1">
							<?php esc_html_e( 'Popular Tags', 'happy-blocks' ); ?>
							</a>
						</li>
						<li>
							<a role="menuitem" class="x-dropdown-link x-link"
								href="<?php echo esc_url( localized_wpcom_url( '//wordpress.com/reader/search/' ) ); ?>"
								tabindex="-1">
							<?php esc_html_e( 'Blog Search', 'happy-blocks' ); ?>
							</a>
						</li>
					</ul>
				</div>
				<div class="x-dropdown-content" data-dropdown-name="learn" role="menu"
					aria-label="<?php esc_attr_e( 'Learn', 'happy-blocks' ); ?>" aria-hidden="true">
					<ul role="menu">
						<li>
							<a role="menuitem" class="x-dropdown-link x-link"
								href="<?php echo esc_url( localized_wpcom_url( '//wordpress.com/learn/' ) ); ?>"
								tabindex="-1">
								<?php esc_html_e( 'Learn WordPress.com', 'happy-blocks' ); ?>
							</a>
						</li>
						<li>
							<a role="menuitem" class="x-dropdown-link x-link"
								href="<?php echo esc_url( localized_wpcom_url( '//wordpress.com/learn/webinars/' ) ); ?>"
								tabindex="-1">
								<?php esc_html_e( 'Webinars', 'happy-blocks' ); ?>
							</a>
						</li>
						<li>
							<a role="menuitem" class="x-dropdown-link x-link"
								href="<?php echo esc_url( localized_wpcom_url( '//wordpress.com/learn/courses/' ) ); ?>"
								tabindex="-1">
								<?php esc_html_e( 'Courses', 'happy-blocks' ); ?>
							</a>
						</li>
						<li>
							<a role="menuitem" class="x-dropdown-link x-link"
								href="<?php echo esc_url( localized_wpcom_url( '//wordpress.com/forums/' ) ); ?>"
								tabindex="-1">
								<?php esc_html_e( 'Community Forum', 'happy-blocks' ); ?>
							</a>
						</li>
						<li>
							<a role="menuitem" class="x-dropdown-link x-link"
								href="<?php echo esc_url( localized_wpcom_url( '//wordpress.com/support/' ) ); ?>"
								tabindex="-1">
								<?php esc_html_e( 'Support Guides', 'happy-blocks' ); ?>
							</a>
						</li>
					</ul>
				</div>
			</div>
			<!-- Desktop dropdowns end here. -->
			<!-- Mobile menu starts here. -->
			<div class="x-menu" role="menu"
				aria-label="<?php esc_attr_e( 'WordPress.com Navigation Menu', 'happy-blocks' ); ?>" aria-hidden="true">
				<div class="x-menu-overlay"></div>
				<div class="x-menu-content">
					<button class="x-menu-button x-link" tabindex="-1">
						<span
							class="x-hidden"><?php esc_html_e( 'Close the navigation menu', 'happy-blocks' ); ?></span>
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
								<a role="menuitem" class="x-menu-link x-link"
									href="<?php echo esc_url( localized_wpcom_url( 'https://wordpress.com/start/' ) ); ?>"
									tabindex="-1">
									<?php esc_html_e( 'Sign Up', 'happy-blocks' ); ?> <span class="x-menu-link-chevron"
										aria-hidden="true"></span>
								</a>
							</li>
							<li class="x-menu-grid-item">
								<a role="menuitem" class="x-menu-link x-link"
									href="<?php echo esc_url( localized_wpcom_url( '//wordpress.com/log-in/' ) ); ?>"
									tabindex="-1">
									<?php esc_html_e( 'Log In', 'happy-blocks' ); ?> <span class="x-menu-link-chevron"
										aria-hidden="true"></span>
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
								<a role="menuitem" class="x-menu-link x-link"
									href="<?php echo esc_url( localized_wpcom_url( '//wordpress.com/pricing/' ) ); ?>"
									tabindex="-1">
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
								<a role="menuitem" class="x-menu-link x-link"
									href="<?php echo esc_url( localized_wpcom_url( '//wordpress.com/hosting/' ) ); ?>"
									tabindex="-1">
									<?php echo esc_html( fixme__( 'WordPress Hosting', __( 'Hosting', 'happy-blocks' ) ) ); ?>
								</a>
							</li>
							<li class="x-menu-grid-item">
								<a role="menuitem" class="x-menu-link x-link"
									href="<?php echo esc_url( localized_wpcom_url( '//wordpress.com/domains/' ) ); ?>"
									tabindex="-1">
									<?php echo esc_html( fixme__( 'Domain Names', __( 'Domains', 'happy-blocks' ) ) ); ?>
								</a>
							</li>
							<li class="x-menu-grid-item">
								<a role="menuitem" class="x-menu-link x-link"
									href="<?php echo esc_url( localized_wpcom_url( '//wordpress.com/website-builder/' ) ); ?>"
									tabindex="-1">
									<?php esc_html_e( 'Website Builder', 'happy-blocks' ); ?>
								</a>
							</li>
							<li class="x-menu-grid-item">
								<a role="menuitem" class="x-menu-link x-link"
									href="<?php echo esc_url( localized_wpcom_url( '//wordpress.com/create-blog/' ) ); ?>"
									tabindex="-1">
									<?php echo esc_html( fixme__( 'Create a Blog', __( 'Blogs', 'happy-blocks' ) ) ); ?>
								</a>
							</li>
							<li class="x-menu-grid-item">
								<a role="menuitem" class="x-menu-link x-link"
									href="<?php echo esc_url( localized_wpcom_url( 'https://wordpress.com/newsletter/' ) ); ?>"
									tabindex="-1">
									<?php echo esc_html( __( 'Newsletter', 'happy-blocks' ) ); ?>
								</a>
							</li>
							<li class="x-menu-grid-item">
								<a role="menuitem" class="x-menu-link x-link"
									href="<?php echo esc_url( localized_wpcom_url( '//wordpress.com/professional-email/' ) ); ?>"
									tabindex="-1">
									<?php echo esc_html( fixme__( 'Professional Email', __( 'Email', 'happy-blocks' ) ) ); ?>
								</a>
							</li>
							<li class="x-menu-grid-item">
								<a role="menuitem" class="x-menu-link x-link"
									href="<?php echo esc_url( localized_wpcom_url( '//wordpress.com/website-design-service/' ) ); ?>"
									tabindex="-1">
									<?php echo esc_html( __( 'Website Design Services', 'happy-blocks' ) ); ?>
								</a>
							</li>
							<li class="x-menu-grid-item">
								<a role="menuitem" class="x-menu-link x-link"
									href="<?php echo esc_url( localized_wpcom_url( '//wordpress.com/ecommerce/' ) ); ?>"
									tabindex="-1">
									<?php echo esc_html( __( 'Commerce', 'happy-blocks' ) ); ?>
								</a>
							</li>
							<li class="x-menu-grid-item">
								<a role="menuitem" class="x-menu-link x-link"
									href="<?php echo esc_url( 'https://wpvip.com/?utm_source=WordPresscom&utm_medium=automattic_referral&utm_campaign=top_nav' ); ?>"
									tabindex="-1">
									<?php esc_html_e( 'Enterprise', 'happy-blocks' ); ?>
									<svg width="9" height="9" xmlns="http://www.w3.org/2000/svg"
										class="x-icon x-icon--external" role="img" aria-hidden="true" focusable="false">
										<path
											d="M5.5 0v1h1.795L2.38 5.915l.705.705L8 1.705V3.5h1V0H5.5zM8 8H1V1h3V0H1a1 1 0 00-1 1v7a1 1 0 001 1h7a1 1 0 001-1V5H8v3z">
										</path>
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
								<a role="menuitem" class="x-menu-link x-link"
									href="<?php echo esc_url( localized_wpcom_url( 'https://wordpress.com/features/' ) ); ?>"
									tabindex="-1">
									<?php esc_html_e( 'Overview', 'happy-blocks' ); ?>
								</a>
							</li>
						</ul>
						<ul class="x-menu-grid" role="menu">
							<li class="x-menu-grid-item">
								<a role="menuitem" class="x-menu-link x-link"
									href="<?php echo esc_url( localized_wpcom_url( 'https://wordpress.com/themes' ) ); ?>"
									tabindex="-1">
									<?php echo esc_html( fixme__( 'WordPress Themes', __( 'Themes', 'happy-blocks' ) ) ); ?>
								</a>
							</li>
							<li class="x-menu-grid-item">
								<a role="menuitem" class="x-menu-link x-link"
									href="<?php echo esc_url( localized_wpcom_url( 'https://wordpress.com/plugins' ) ); ?>"
									tabindex="-1">
									<?php echo esc_html( fixme__( 'WordPress Plugins', __( 'Plugins', 'happy-blocks' ) ) ); ?>
								</a>
							</li>
							<li class="x-menu-grid-item">
								<a role="menuitem" class="x-menu-link x-link"
								   href="<?php echo esc_url( localized_wpcom_url( 'https://wordpress.com/patterns' ) ); ?>"
								   tabindex="-1">
									<?php echo esc_html( fixme__( 'WordPress Patterns', __( 'Patterns', 'happy-blocks' ) ) ); ?>
								</a>
							</li>
							<li class="x-menu-grid-item">
								<a role="menuitem" class="x-menu-link x-link"
									href="<?php echo esc_url( localized_wpcom_url( 'https://wordpress.com/google/' ) ); ?>"
									tabindex="-1">
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
								<a role="menuitem" class="x-menu-link x-link"
									href="<?php echo esc_url( localized_wpcom_url( '//wordpress.com/blog/' ) ); ?>"
									tabindex="-1">
									<?php esc_html_e( 'News', 'happy-blocks' ); ?>
								</a>
							</li>
							<li class="x-menu-grid-item">
								<a role="menuitem" class="x-menu-link x-link"
									href="<?php echo esc_url( localized_wpcom_url( '//wordpress.com/go/' ) ); ?>"
									tabindex="-1">
									<?php echo esc_html( fixme__( 'Website Building Tips', __( 'Expert Tips', 'happy-blocks' ) ) ); ?>
								</a>
							</li>
							<li class="x-menu-grid-item">
								<a role="menuitem" class="x-menu-link x-link"
									href="<?php echo esc_url( localized_wpcom_url( '//wordpress.com/business-name-generator/' ) ); ?>"
									tabindex="-1">
									<?php esc_html_e( 'Business Name Generator', 'happy-blocks' ); ?>
								</a>
							</li>
							<li class="x-menu-grid-item">
								<a role="menuitem" class="x-menu-link x-link"
									href="<?php echo esc_url( localized_wpcom_url( '//wordpress.com/logo-maker/' ) ); ?>"
									tabindex="-1">
									<?php esc_html_e( 'Logo Maker', 'happy-blocks' ); ?>
								</a>
							</li>
							<li class="x-menu-grid-item">
								<a role="menuitem" class="x-menu-link x-link"
									href="<?php echo esc_url( localized_wpcom_url( '//wordpress.com/discover/' ) ); ?>"
									tabindex="-1">
								<?php esc_html_e( 'Discover New Posts', 'happy-blocks' ); ?>
								</a>
							</li>
							<li class="x-menu-grid-item">
								<a role="menuitem" class="x-menu-link x-link"
									href="<?php echo esc_url( localized_wpcom_url( '//wordpress.com/tags/' ) ); ?>"
									tabindex="-1">
								<?php esc_html_e( 'Popular Tags', 'happy-blocks' ); ?>
								</a>
							</li>
							<li class="x-menu-grid-item">
								<a role="menuitem" class="x-menu-link x-link"
									href="<?php echo esc_url( localized_wpcom_url( '//wordpress.com/reader/search/' ) ); ?>"
									tabindex="-1">
								<?php esc_html_e( 'Blog Search', 'happy-blocks' ); ?>
								</a>
							</li>
						</ul>
					</div>
					<div class="x-menu-list">
						<div class="x-menu-list-title">
							<?php esc_html_e( 'Learn', 'happy-blocks' ); ?>
						</div>
						<ul class="x-menu-grid" role="menu">
							<li class="x-menu-grid-item">
								<a role="menuitem" class="x-menu-link x-link"
									href="<?php echo esc_url( localized_wpcom_url( '//wordpress.com/learn/' ) ); ?>"
									tabindex="-1">
									<?php esc_html_e( 'Learn WordPress.com', 'happy-blocks' ); ?>
								</a>
							</li>
							<li class="x-menu-grid-item">
								<a role="menuitem" class="x-menu-link x-link"
									href="<?php echo esc_url( localized_wpcom_url( '//wordpress.com/learn/webinars/' ) ); ?>"
									tabindex="-1">
									<?php esc_html_e( 'Webinars', 'happy-blocks' ); ?>
								</a>
							</li>
							<li class="x-menu-grid-item">
								<a role="menuitem" class="x-menu-link x-link"
									href="<?php echo esc_url( localized_wpcom_url( '//wordpress.com/learn/courses/' ) ); ?>"
									tabindex="-1">
									<?php esc_html_e( 'Courses', 'happy-blocks' ); ?>
								</a>
							</li>
							<li class="x-menu-grid-item">
								<a role="menuitem" class="x-menu-link x-link"
									href="<?php echo esc_url( localized_wpcom_url( '//wordpress.com/forums/' ) ); ?>"
									tabindex="-1">
									<?php esc_html_e( 'Community Forum', 'happy-blocks' ); ?>
								</a>
							</li>
							<li class="x-menu-grid-item">
								<a role="menuitem" class="x-menu-link x-link"
									href="<?php echo esc_url( localized_wpcom_url( '//wordpress.com/support/' ) ); ?>"
									tabindex="-1">
									<?php esc_html_e( 'Support Guides', 'happy-blocks' ); ?>
								</a>
							</li>
						</ul>
					</div>
				</div>
			</div>
			<!-- Mobile menu ends here. -->
		</div>
	</div>
</div>
