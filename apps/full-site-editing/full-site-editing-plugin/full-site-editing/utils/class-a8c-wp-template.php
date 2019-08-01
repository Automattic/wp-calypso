<?php
/**
 * A8C WP Template file.
 *
 * @package full-site-editing
 */

/**
 * Class A8C_WP_Template
 */
class A8C_WP_Template {
	/**
	 * Header template part type constant.
	 *
	 * @var string HEADER
	 */
	const HEADER = 'header';

	/**
	 * Footer template part type constant
	 *
	 * @var string FOOTER
	 */
	const FOOTER = 'footer';

	/**
	 * Name of the currently active theme that is used to reference its template CPTs.
	 *
	 * @var string $current_theme_name Name of currently active theme on the site.
	 */
	private $current_theme_name;

	/**
	 * List of template part types that FSE is currently supporting.
	 *
	 * @var array $supported_template_types Array of strings containing supported template part types.
	 */
	public $supported_template_types = [ self::HEADER, self::FOOTER ];

	/**
	 * A8C_WP_Template constructor.
	 */
	public function __construct() {
		$this->current_theme_name = get_option( 'stylesheet' );
	}

	/**
	 * Checks whether the provided template part type is supported in FSE.
	 *
	 * @param string $template_part_type String representing the template part type.
	 *
	 * @return bool True if provided template part type is supported in FSE, false otherwise.
	 */
	public function is_supported_template_part_type( $template_part_type ) {
		return in_array( $template_part_type, $this->supported_template_types, true );
	}

	/**
	 * Returns the post ID of the default template part CPT for a given template type.
	 *
	 * @param string $template_part_type String representing the template part type.
	 *
	 * @return null|int Template part ID if it exists or null otherwise.
	 */
	public function get_template_part_id( $template_part_type ) {
		if ( ! $this->is_supported_template_part_type( $template_part_type ) ) {
			return null;
		}

		$term = get_term_by( 'name', "$this->current_theme_name-$template_part_type", 'wp_template_part_type', ARRAY_A );

		// Bail if current site doesn't have this term registered.
		if ( ! isset( $term['term_id'] ) ) {
			return null;
		}

		$template_part_ids = get_objects_in_term( $term['term_id'], $term['taxonomy'], [ 'order' => 'DESC' ] );

		// Bail if we haven't found any post instances for this template part type.
		if ( empty( $template_part_ids ) ) {
			return null;
		}

		/*
		 * Assuming that we'll have just one default template part for now.
		 * We'll add support for multiple header and footer variations in future iterations.
		 */
		return $template_part_ids[0];
	}

	/**
	 * Returns template part content for given template part type.
	 *
	 * @param string $template_part_type String representing the template part type.
	 *
	 * @return null|string Template part content if it exists or null otherwise.
	 */
	public function get_template_part_content( $template_part_type ) {
		if ( ! $this->is_supported_template_part_type( $template_part_type ) ) {
			return null;
		}

		$template_part_id = $this->get_template_part_id( $template_part_type );

		if ( null === $template_part_id ) {
			return null;
		}

		$template_part_post = get_post( $template_part_id );

		if ( null === $template_part_post ) {
			return;
		}

		return $template_part_post->post_content;
	}

	/**
	 * Returns full page template content.
	 *
	 * We only support one page template for now with header at the top and footer at the bottom.
	 *
	 * @return null|string
	 */
	public function get_page_template_content() {
		$header_id = $this->get_template_part_id( self::HEADER );
		$footer_id = $this->get_template_part_id( self::FOOTER );

		return "<!-- wp:a8c/template {\"templateId\":$header_id,\"className\":\"site-header site-branding\"} /-->" .
				'<!-- wp:a8c/post-content /-->' .
				"<!-- wp:a8c/template {\"templateId\":$footer_id,\"className\":\"site-footer\"} /-->";
	}

	/**
	 * Returns array of blocks that represent the template.
	 *
	 * @return array
	 */
	public function get_template_blocks() {
		$template_content = $this->get_page_template_content();
		$template_blocks  = parse_blocks( $template_content );
		return is_array( $template_blocks ) ? $template_blocks : [];
	}

	/**
	 * Output FSE template part markup.
	 *
	 * @param string $template_part_type String representing the template part type.
	 *
	 * @return null|void Null if unsupported template part type is passed, outputs content otherwise.
	 */
	public function output_template_part_content( $template_part_type ) {
		if ( ! $this->is_supported_template_part_type( $template_part_type ) ) {
			return null;
		}

		// phpcs:disable WordPress.Security.EscapeOutput.OutputNotEscaped
		echo do_blocks( $this->get_template_part_content( $template_part_type ) );
	}
}
