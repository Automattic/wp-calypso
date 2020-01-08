<?php
/**
 * WP_REST_Newspack_Articles_Controller file.
 *
 * @package WordPress
 */

/**
 * Class WP_REST_Newspack_Articles_Controller.
 */
class WP_REST_Newspack_Articles_Controller extends WP_REST_Controller {

	/**
	 * Attribute schema.
	 *
	 * @var array
	 */
	public $attribute_schema;

	/**
	 * Constructs the controller.
	 *
	 * @access public
	 */
	public function __construct() {
		$this->namespace = 'newspack-blocks/v1';
		$this->rest_base = 'articles';
	}

	/**
	 * Registers the necessary REST API routes.
	 *
	 * @access public
	 */
	public function register_routes() {
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base,
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get_items' ),
					'args'                => $this->get_attribute_schema(),
					'permission_callback' => '__return_true',
				),
			)
		);
	}

	/**
	 * Returns a list of rendered posts.
	 *
	 * @param WP_REST_Request $request Request object.
	 * @return WP_REST_Response
	 */
	public function get_items( $request ) {
		$page        = $request->get_param( 'page' ) ?? 1;
		$exclude_ids = $request->get_param( 'exclude_ids' ) ?? array();
		$next_page   = $page + 1;
		$attributes  = wp_parse_args(
			$request->get_params() ?? array(),
			wp_list_pluck( $this->get_attribute_schema(), 'default' )
		);

		$article_query_args = Newspack_Blocks::build_articles_query( $attributes );

		$query = array_merge(
			$article_query_args,
			array(
				'post__not_in' => $exclude_ids,
			)
		);

		// Run Query.
		$article_query = new WP_Query( $query );

		// Defaults.
		$items    = array();
		$next_url = '';

		// The Loop.
		while ( $article_query->have_posts() ) {
			$article_query->the_post();
			$items[]['html'] = Newspack_Blocks::template_inc(
				__DIR__ . '/templates/article.php',
				array(
					'attributes' => $attributes,
				)
			);
		}

		// Provide next URL if there are more pages.
		if ( $next_page <= $article_query->max_num_pages ) {
			$next_url = add_query_arg(
				array_merge(
					array_map(
						function( $attribute ) {
							return false === $attribute ? '0' : $attribute;
						},
						$attributes
					),
					array( 'page' => $next_page ) // phpcs:ignore PHPCompatibility.Syntax.NewShortArray.Found
				),
				rest_url( '/newspack-blocks/v1/articles' )
			);
		}

		return rest_ensure_response(
			array(
				'items' => $items,
				'next'  => $next_url,
			)
		);
	}

	/**
	 * Sets up and returns attribute schema.
	 *
	 * @return array
	 */
	public function get_attribute_schema() {
		if ( empty( $this->attribute_schema ) ) {
			$block_json = json_decode(
				file_get_contents( __DIR__ . '/block.json' ), // phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents
				true
			);

			$this->attribute_schema = array_merge(
				$block_json['attributes'],
				array(
					'exclude_ids' => array(
						'type'    => 'array',
						'default' => array(),
						'items'   => array(
							'type' => 'integer',
						),
					),
				)
			);
		}
		return $this->attribute_schema;
	}
}
