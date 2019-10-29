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
	public $supported_template_types = [ self::HEADER, self::FOOTER ];

	/**
	 * A8C_WP_Template constructor.
	 */
	public function __construct() {
		$this->current_theme_name = $this->normalize_theme_slug( get_stylesheet() );
	}

	/**
	 * Returns normalized theme slug for the current theme.
	 *
	 * Normalize WP.com theme slugs that differ from those that we'll get on self hosted sites.
	 * For example, we will get 'modern-business-wpcom' when retrieving theme slug on self hosted sites,
	 * but due to WP.com setup, on Simple sites we'll get 'pub/modern-business' for the theme.
	 *
	 * @param string $theme_slug Theme slug to check support for.
	 *
	 * @return string Normalized theme slug.
	 */
	public function normalize_theme_slug( $theme_slug ) {
		if ( 'pub/' === substr( $theme_slug, 0, 4 ) ) {
			$theme_slug = substr( $theme_slug, 4 );
		}

		if ( '-wpcom' === substr( $theme_slug, -6, 6 ) ) {
			$theme_slug = substr( $theme_slug, 0, -6 );
		}

		return $theme_slug;
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

		$template_ids = get_objects_in_term( $term['term_id'], $term['taxonomy'], [ 'order' => 'DESC' ] );

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

		return "<!-- wp:a8c/template {\"templateId\":$header_id,\"label\":\"" . __( 'Header', 'full-site-editing' ) . '","className":"site-header site-branding"} /-->' .
				'<!-- wp:a8c/post-content /-->' .
				"<!-- wp:a8c/template {\"templateId\":$footer_id,\"label\":\"" . __( 'Footer', 'full-site-editing' ) . '","className":"site-footer"} /-->';
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
