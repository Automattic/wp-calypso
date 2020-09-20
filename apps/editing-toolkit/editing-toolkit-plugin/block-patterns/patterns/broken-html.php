<?php
/**
 * Text pattern.
 *
 * @package A8C\FSE
 */

$markup = '
<!-- wp:heading -->
Totally not valid html </html></div></dove>
<!-- /wp:heading --></div>
';

return array(
	'__file'        => 'wp_block',
	'title'         => esc_html__( 'Borked Block', 'full-site-editing' ),
	'categories'    => array( 'text' ),
	'content'       => sprintf(
		$markup
	),
	'viewportWidth' => 1280,
);
