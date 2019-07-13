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
	const TEMPLATE_META_KEY = '_wp_template_id';

	/**
	 * ID of the current post that's being rendered.
	 *
	 * @var int $current_post_id ID of the current post.
	 */
	private $current_post_id;

	/**
	 * ID of the template associated with the current post.
	 *
	 * @var int $template_id ID of the template associated with the current post.
	 */
	private $template_id;

	/**
	 * Name of the currently active theme that is used to reference its template CPTs.
	 *
	 * @var string $current_theme_name Name of currently active theme on the site.
	 */
	private $current_theme_name;


	/**
	 * A8C_WP_Template constructor.
	 *
	 * @param int|null $post_id Defaults to current post id if not passed.
	 */
	public function __construct( $post_id = null ) {
		if ( null === $post_id ) {
			$post = get_post();

			if ( ! $post ) {
				return;
			}

			$post_id = $post->ID;
		}

		$this->current_post_id    = $post_id;
		$this->template_id        = $this->get_template_id();
		$this->current_theme_name = get_option( 'stylesheet' );
	}

	/**
	 * Returns template ID for current page if it exists.
	 *
	 * If template id is set in current post's meta (_wp_template_id) it will be returned.
	 * Otherwise it falls back to global page template that is marked with page_template term
	 * in wp_template_type taxonomy. Note that having only one term of this kind is not
	 * currently enforced, so we'll just pick the latest page template that was created
	 * (based on its post ID).
	 *
	 * @return null|int template ID for current page, or null if it doesn't exist.
	 */
	public function get_template_id() {
		// If the specific template is referenced in post meta, use it.
		$template_id = get_post_meta( $this->current_post_id, self::TEMPLATE_META_KEY, true );

		if ( ! empty( $template_id ) ) {
			return $template_id;
		}

		$current_theme_name = get_option( 'stylesheet' );

		// Otherwise, fall back to latest global page template defined for current theme.
		$term = get_term_by( 'name', "$current_theme_name-page-template", 'wp_template_type', ARRAY_A );

		if ( ! isset( $term['term_id'] ) ) {
			return null;
		}

		$template_ids = get_objects_in_term( $term['term_id'], $term['taxonomy'], [ 'order' => 'DESC' ] );

		if ( empty( $template_ids ) ) {
			return null;
		}

		return $template_ids[0];
	}

	/**
	 * Returns template's post content.
	 *
	 * @return null|string
	 */
	public function get_template_content() {
		if ( empty( $this->template_id ) ) {
			return null;
		}

		$template_post = get_post( $this->template_id );

		return null === $template_post ? null : $template_post->post_content;
	}

	/**
	 * Returns array of blocks that represent the template.
	 *
	 * @return array
	 */
	public function get_template_blocks() {
		$template_content = $this->get_template_content();

		$template_blocks = parse_blocks( $template_content );

		return is_array( $template_blocks ) ? $template_blocks : [];
	}

	/**
	 * Returns the post ID of the template part CPT that represents the Header in this template.
	 *
	 * This is simplified for now and we are just assuming that the first template part in every
	 * template will represent the Header.
	 *
	 * @return null|int Header template part ID if it exists or null otherwise.
	 */
	public function get_header_id() {
		$template_blocks = $this->get_template_blocks();

		if ( empty( $template_blocks ) ) {
			return null;
		}

		// TODO: Incorporate wp_template_part taxonomy checks.
		if ( ! isset( $template_blocks[0]['attrs']['templateId'] ) ) {
			return null;
		}

		$header_id = $template_blocks[0]['attrs']['templateId'];

		if ( ! has_term( "$this->current_theme_name-header", 'wp_template_part_type', $header_id ) ) {
			return null;
		}

		return $header_id;
	}

	/**
	 * Returns the post ID of the template part CPT that represents the Footer in this template.
	 *
	 * This is simplified for now and we are just assuming that the last template part in every
	 * template will represent the Footer.
	 *
	 * @return null|int Footer template part ID if it exists or null otherwise.
	 */
	public function get_footer_id() {
		$template_blocks = $this->get_template_blocks();

		if ( ! isset( end( $template_blocks )['attrs']['templateId'] ) ) {
			return null;
		}

		$footer_id = end( $template_blocks )['attrs']['templateId'];

		if ( ! has_term( "$this->current_theme_name-footer", 'wp_template_part_type', $footer_id ) ) {
			return null;
		}

		return $footer_id;
	}

	/**
	 * Returns header template part content of current template.
	 *
	 * @return null|string
	 */
	public function get_header_content() {
		$header_id = $this->get_header_id();

		if ( null === $header_id ) {
			return null;
		}

		$header = get_post( $header_id );

		if ( null === $header ) {
			return null;
		}

		return $header->post_content;
	}

	/**
	 * Returns footer template part content of current template.
	 *
	 * @return null|string
	 */
	public function get_footer_content() {
		$footer_id = $this->get_footer_id();

		if ( null === $footer_id ) {
			return null;
		}

		$footer = get_post( $footer_id );

		if ( null === $footer ) {
			return null;
		}

		return $footer->post_content;
	}
}

/**
 * Template tag to output the FSE template header markup.
 */
function fse_get_header() {
	$template = new A8C_WP_Template();
	// phpcs:disable WordPress.Security.EscapeOutput.OutputNotEscaped
	echo do_blocks( $template->get_header_content() );
}

/**
 * Template tag to output the FSE template footer markup.
 */
function fse_get_footer() {
	$template = new A8C_WP_Template();
	// phpcs:disable WordPress.Security.EscapeOutput.OutputNotEscaped
	echo do_blocks( $template->get_footer_content() );
}
