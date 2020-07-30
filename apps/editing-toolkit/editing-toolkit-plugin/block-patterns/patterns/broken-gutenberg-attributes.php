<?php
/**
 * Text pattern.
 *
 * @package A8C\FSE
 */

$markup = '
<!-- wp:heading {"aValidAttr":"aValue", not even valid json:Some garbage} -->
<div>Some valid html</div>
<!-- /wp:heading -->
';

return array(
	'__file'        => 'wp_block',
	'title'         => esc_html__( 'Broken Guteberg attributes block', 'full-site-editing' ),
	'categories'    => array( 'text' ),
	'content'       => sprintf(
		$markup
	),
	'viewportWidth' => 1280,
);
