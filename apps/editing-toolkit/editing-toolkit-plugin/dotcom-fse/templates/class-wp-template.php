<?php
/**
 * WP Template file.
 *
 * @package A8C\FSE
 */

namespace A8C\FSE;

/**
 * Class WP_Template
 */
class WP_Template {
	/**
	 * Header template type constant.
	 *
	 * @var string HEADER
	 */
	const HEADER = 'header';

	/**
	 * Footer template type constant
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
	 * List of template types that FSE is currently supporting.
	 *
	 * @var array $supported_template_types Array of strings containing supported template types.
	 */
	public $supported_template_types = array( self::HEADER, self::FOOTER );

	/**
	 * A8C_WP_Template constructor.
	 *
	 * @param string $theme Defaults to the current theme slug, but can be
	 *                      overriden to use this class with themes which are
	 *                      not currently active.
	 */
	public function __construct( $theme = null ) {
		if ( ! isset( $theme ) ) {
			$theme = get_stylesheet();
		}
		$this->current_theme_name = normalize_theme_slug( $theme );
	}

	/**
	 * Checks whether the provided template type is supported in FSE.
	 *
	 * @param string $template_type String representing the template type.
	 *
	 * @return bool True if provided template type is supported in FSE, false otherwise.
	 */
	public function is_supported_template_type( $template_type ) {
		return in_array( $template_type, $this->supported_template_types, true );
	}

	/**
	 * Returns the post ID of the default template CPT for a given template type.
	 *
	 * @param string $template_type String representing the template type.
	 *
	 * @return null|int Template ID if it exists or null otherwise.
	 */
	public function get_template_id( $template_type ) {
		if ( ! $this->is_supported_template_type( $template_type ) ) {
			return null;
		}

		$term = get_term_by( 'name', "$this->current_theme_name-$template_type", 'wp_template_part_type', ARRAY_A );

		// Bail if current site doesn't have this term registered.
		if ( ! isset( $term['term_id'] ) ) {
			return null;
		}

		$template_ids = get_objects_in_term( $term['term_id'], $term['taxonomy'], array( 'order' => 'DESC' ) );

		// Bail if we haven't found any post instances for this template type.
		if ( empty( $template_ids ) ) {
			return null;
		}

		/*
		 * Assuming that we'll have just one default template for now.
		 * We'll add support for multiple header and footer variations in future iterations.
		 */
		return $template_ids[0];
	}

	/**
	 * Returns template content for given template type.
	 *
	 * @param string $template_type String representing the template type.
	 *
	 * @return null|string Template content if it exists or null otherwise.
	 */
	public function get_template_content( $template_type ) {
		if ( ! $this->is_supported_template_type( $template_type ) ) {
			return null;
		}

		$template_id = $this->get_template_id( $template_type );

		if ( null === $template_id ) {
			return null;
		}

		$template_post = get_post( $template_id );

		if ( null === $template_post ) {
			return;
		}

		return $template_post->post_content;
	}

	/**
	 * Returns full page template content.
	 *
	 * We only support one page template for now with header at the top and footer at the bottom.
	 *
	 * @return null|string
	 */
	public function get_page_template_content() {
		$header_id = $this->get_template_id( self::HEADER );
		$footer_id = $this->get_template_id( self::FOOTER );

		/*
		 * Bail if we are missing header or footer. Otherwise this would cause us to
		 * always return some page template content and show template parts (with empty IDs),
		 * even for themes that don't support FSE.
		 */
		if ( ! $header_id || ! $footer_id ) {
			return null;
		}

		return "<!-- wp:a8c/template {\"templateId\":$header_id,\"label\":\"" . __( 'Header', 'full-site-editing' ) . '","className":"fse-template-part fse-header"} /-->' .
				'<!-- wp:a8c/post-content /-->' .
				"<!-- wp:a8c/template {\"templateId\":$footer_id,\"label\":\"" . __( 'Footer', 'full-site-editing' ) . '","className":"fse-template-part fse-footer"} /-->';
	}

	/**
	 * Returns array of blocks that represent the template.
	 *
	 * @return array
	 */
	public function get_template_blocks() {
		$template_content = $this->get_page_template_content();
		$template_blocks  = parse_blocks( $template_content );
		return is_array( $template_blocks ) ? $template_blocks : array();
	}

	/**
	 * Output FSE template markup.
	 *
	 * @param string $template_type String representing the template type.
	 *
	 * @return null|void Null if unsupported template type is passed, outputs content otherwise.
	 */
	public function output_template_content( $template_type ) {
		if ( ! $this->is_supported_template_type( $template_type ) ) {
			return null;
		}

		// Things that follow are from wp-includes/default-filters.php
		// not everything is appropriate for template content as opposed to post content.
		global $wp_embed;
		$content = $this->get_template_content( $template_type );

		// 8 priority
		$content = $wp_embed->run_shortcode( $content );
		$content = $wp_embed->autoembed( $content );

		// 9 priority
		$content = do_blocks( $content );

		// 10 priority
		$content = wptexturize( $content );

		// 11 priority
		$content = do_shortcode( $content );

		$content = prepend_attachment( $content );

		if ( has_filter( 'a8c_fse_make_content_images_responsive' ) ) {
			$content = apply_filters( 'a8c_fse_make_content_images_responsive', $content );
		} else {
			$content = wp_make_content_images_responsive( $content );
		}

		// phpcs:disable WordPress.Security.EscapeOutput.OutputNotEscaped
		echo $content;
	}
}
