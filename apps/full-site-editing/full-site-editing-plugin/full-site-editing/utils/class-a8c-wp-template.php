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
	 * A8C_WP_Template constructor.
	 *
	 * @param int|null $post_id Defaults to current post id if not passed.
	 */
	public function __construct( $post_id = null ) {
		if ( null === $post_id ) {
			$post_id = get_post()->ID;
		}

		$this->current_post_id = $post_id;
		$this->template_id     = get_post_meta( $this->current_post_id, self::TEMPLATE_META_KEY, true );
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

		return $template_blocks[0]['attrs']['templateId'];
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

		// TODO: Incorporate wp_template_part taxonomy checks.
		if ( ! isset( end( $template_blocks )['attrs']['templateId'] ) ) {
			return null;
		}

		return end( $template_blocks )['attrs']['templateId'];
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
