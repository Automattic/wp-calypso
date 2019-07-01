<?php
/**
 * Template data inserter file.
 *
 * @package full-site-editing
 */

/**
 * Class A8C_WP_Template_Data_Inserter
 */
class A8C_WP_Template_Data_Inserter {
	/**
	 * This function will be called on plugin activation hook.
	 */
	public function insert_default_template_data() {
		$header_id = wp_insert_post(
			[
				'post_title'     => 'Header',
				'post_content'   => $this->get_header_content(),
				'post_status'    => 'publish',
				'post_type'      => 'wp_template_part',
				'comment_status' => 'closed',
				'ping_status'    => 'closed',
			]
		);

		if ( ! term_exists( 'header', 'wp_template_part_type' ) ) {
			wp_insert_term( 'header', 'wp_template_part_type' );
		}

		wp_set_object_terms( $header_id, 'header', 'wp_template_part_type' );

		$footer_id = wp_insert_post(
			[
				'post_title'     => 'Footer',
				'post_content'   => $this->get_footer_content(),
				'post_status'    => 'publish',
				'post_type'      => 'wp_template_part',
				'comment_status' => 'closed',
				'ping_status'    => 'closed',
			]
		);

		if ( ! term_exists( 'footer', 'wp_template_part_type' ) ) {
			wp_insert_term( 'footer', 'wp_template_part_type' );
		}

		wp_set_object_terms( $footer_id, 'footer', 'wp_template_part_type' );

		$page_template_id = wp_insert_post(
			[
				'post_title'     => 'Page Template',
				'post_content'   => $this->get_template_content( $header_id, $footer_id ),
				'post_status'    => 'publish',
				'post_type'      => 'wp_template',
				'comment_status' => 'closed',
				'ping_status'    => 'closed',
			]
		);

		if ( ! term_exists( 'footer', 'wp_template_part_type' ) ) {
			wp_insert_term( 'footer', 'wp_template_part_type' );
		}

		wp_set_object_terms( $page_template_id, 'page_template', 'wp_template_type' );
	}

	/**
	 * Returns default header template part content.
	 *
	 * @return string
	 */
	public function get_header_content() {
		// TODO: replace with header blocks once they are ready.
		return '<!-- wp:a8c/site-title /-->' .
				'<!-- wp:a8c/site-description /-->' .
				'<!-- wp:a8c/navigation-menu /-->';
	}

	/**
	 * Returns default footer template part content.
	 *
	 * @return string
	 */
	public function get_footer_content() {
		return '<!-- wp:a8c/navigation-menu {\"themeLocation\":"footer"} /-->';
	}

	/**
	 * Returns default page template content.
	 *
	 * @param int $header_id ID of referenced header template part CPT.
	 * @param int $footer_id ID of referenced footer template part CPT.
	 *
	 * @return string
	 */
	public function get_template_content( $header_id, $footer_id ) {
		return "<!-- wp:a8c/template {\"templateId\":$header_id,\"align\":\"full\"} /-->" .
				'<!-- wp:a8c/post-content {"align":"full"} /-->' .
				"<!-- wp:a8c/template {\"templateId\":$footer_id,\"align\":\"full\"} /-->";
	}
}
