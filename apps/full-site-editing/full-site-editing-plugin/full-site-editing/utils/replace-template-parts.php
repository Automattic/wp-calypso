<?php
/**
 * Replace template parts file.
 *
 * @package full-site-editing
 */

/**
 * Callback function that will be executed before the output buffer is flushed.
 *
 * It is processing the final HTML before it's sent to the user and replacing different
 * page areas with appropriate template parts (wp_template_part CPT) depending on the
 * template (wp_template CPT) that has been assigned to the current page.
 *
 * @param string $html HTML code passed by output buffer.
 *
 * @return string HTML code with replaced header node if it exists.
 */
function a8c_fse_replace_template_parts( $html ) {
	$page_template = new A8C_WP_Template();

	// Array that defines replacement pairs. 'xpath_query' specifies the element from the original HTML
	// that should be replaced, and 'fse_content' contains the replacement HTML code.
	$replacements = [
		'header' => [
			// Query the first <header> element that contains the 'site-header' class.
			// Note that this is not always the direct descendant of <body> since it's sometimes wrapped in a <div>.
			'xpath_query' => "(/html/body//header[@class='site-header'])[1]",
			'fse_content' => $page_template->get_header_content(),
		],
		'footer' => [
			// Query the first <footer> element that contains the 'site-footer' class.
			'xpath_query' => "(/html/body//footer[@class='site-footer'])[1]",
			'fse_content' => $page_template->get_footer_content(),
		],
	];

	$doc = new DOMDocument();
	// phpcs:disable WordPress.NamingConventions.ValidVariableName.UsedPropertyNotSnakeCase
	$doc->preserveWhiteSpace = false;
	// phpcs:disable WordPress.PHP.NoSilencedErrors.Discouraged
	@$doc->loadHTML( mb_convert_encoding( $html, 'HTML-ENTITIES', 'UTF-8' ) );

	$temp_doc                     = new DOMDocument();
	$temp_doc->preserveWhiteSpace = false;

	foreach ( $replacements as $replacement ) {
		if ( empty( $replacement['xpath_query'] ) || empty( $replacement['fse_content'] ) ) {
			continue;
		}

		$xpath           = new DOMXPath( $doc );
		$candidate_nodes = $xpath->query( $replacement['xpath_query'] );

		if ( 0 === $candidate_nodes->length ) {
			continue;
		}

		$node_to_replace = $candidate_nodes[0];

		@$temp_doc->loadHTML( mb_convert_encoding( $replacement['fse_content'], 'HTML-ENTITIES', 'UTF-8' ) );

		$fse_node = $doc->importNode( $temp_doc->documentElement, true );
		$node_to_replace->parentNode->replaceChild( $fse_node, $node_to_replace );
	}

	return $doc->saveHTML();
}
