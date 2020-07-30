<?php
/**
 * Text pattern.
 *
 * @package A8C\FSE
 */

$markup = '
<!-- wp:heading {"aGutenbergAttribute":"aValue"} -->
<div title="an unclosed html attribute>Some HTML</div>
<!-- /wp:heading -->
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
