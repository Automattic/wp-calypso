<?php
/**
 * Tiled Mosaic Gallery pattern.
 *
 * @package A8C\FSE
 */

$markup = '
<!-- wp:jetpack/tiled-gallery {"align":"full","ids":[651,646,648,650,649,666]} -->
<div class="wp-block-jetpack-tiled-gallery alignfull is-style-rectangular"><div class="tiled-gallery__gallery"><div class="tiled-gallery__row"><div class="tiled-gallery__col"><figure class="tiled-gallery__item"><img alt="" data-height="2000" data-id="651" data-link="https://dotcompatterns.wordpress.com/adam-birkett-qrwadbcqysc-unsplash/" data-url="https://dotcompatterns.files.wordpress.com/2020/04/adam-birkett-qrwadbcqysc-unsplash-1.jpg" data-width="1333" src="https://dotcompatterns.files.wordpress.com/2020/04/adam-birkett-qrwadbcqysc-unsplash-1.jpg"/></figure></div><div class="tiled-gallery__col"><figure class="tiled-gallery__item"><img alt="" data-height="1414" data-id="646" data-link="https://dotcompatterns.wordpress.com/josh-nuttall-piwu5xnvxpk-unsplash/" data-url="https://dotcompatterns.files.wordpress.com/2020/04/josh-nuttall-piwu5xnvxpk-unsplash-1.jpg" data-width="2000" src="https://dotcompatterns.files.wordpress.com/2020/04/josh-nuttall-piwu5xnvxpk-unsplash-1.jpg"/></figure><figure class="tiled-gallery__item"><img alt="" data-height="1335" data-id="648" data-link="https://dotcompatterns.wordpress.com/alexander-andrews-zw07kvdahpw-unsplash/" data-url="https://dotcompatterns.files.wordpress.com/2020/04/alexander-andrews-zw07kvdahpw-unsplash-1.jpg" data-width="2000" src="https://dotcompatterns.files.wordpress.com/2020/04/alexander-andrews-zw07kvdahpw-unsplash-1.jpg"/></figure></div><div class="tiled-gallery__col"><figure class="tiled-gallery__item"><img alt="" data-height="2000" data-id="650" data-link="https://dotcompatterns.wordpress.com/allec-gomes-on-feed-dmlidt7xzna-unsplash/" data-url="https://dotcompatterns.files.wordpress.com/2020/04/allec-gomes-on-feed-dmlidt7xzna-unsplash-1.jpg" data-width="1697" src="https://dotcompatterns.files.wordpress.com/2020/04/allec-gomes-on-feed-dmlidt7xzna-unsplash-1.jpg"/></figure></div></div><div class="tiled-gallery__row"><div class="tiled-gallery__col"><figure class="tiled-gallery__item"><img alt="" data-height="2000" data-id="649" data-link="https://dotcompatterns.wordpress.com/eleventh-wave-l-obc8t32vm-unsplash/" data-url="https://dotcompatterns.files.wordpress.com/2020/04/eleventh-wave-l-obc8t32vm-unsplash-2.jpg" data-width="1333" src="https://dotcompatterns.files.wordpress.com/2020/04/eleventh-wave-l-obc8t32vm-unsplash-2.jpg"/></figure></div><div class="tiled-gallery__col"><figure class="tiled-gallery__item"><img alt="" data-height="1522" data-id="666" data-link="https://dotcompatterns.wordpress.com/jeremy-perkins-v3dr-y7uh24-unsplash-2-3/" data-url="https://dotcompatterns.files.wordpress.com/2020/04/jeremy-perkins-v3dr-y7uh24-unsplash-2-3.jpg" data-width="2402" src="https://dotcompatterns.files.wordpress.com/2020/04/jeremy-perkins-v3dr-y7uh24-unsplash-2-3.jpg"/></figure></div></div></div></div>
<!-- /wp:jetpack/tiled-gallery -->
';

return array(
	'__file'        => 'wp_block',
	'title'         => esc_html__( 'Tiled Mosaic Gallery', 'full-site-editing' ),
	'categories'    => array( 'gallery' ),
	'content'       => $markup,
	'viewportWidth' => 1280,
);
