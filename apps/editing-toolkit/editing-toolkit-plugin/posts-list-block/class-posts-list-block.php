<?php
/**
 * Posts list block file.
 *
 * @package A8C\FSE
 */

namespace A8C\FSE;

/**
 * Class Post_List_Block
 */
class Posts_List_Block {

	/**
	 * Class instance.
	 *
	 * @var \A8C\FSE\Posts_List_Block
	 */
	private static $instance = null;

	/**
	 * Whether we are in the process of rendering the block.
	 *
	 * @var bool
	 */
	private $rendering_block = false;

	/**
	 * A8C_Post_List constructor.
	 */
	private function __construct() {
		add_action( 'init', array( $this, 'register_blocks' ), 100 );
		add_action( 'enqueue_block_editor_assets', array( $this, 'enqueue_scripts' ), 100 );
		add_action( 'enqueue_block_assets', array( $this, 'enqueue_styles' ), 100 );
	}

	/**
	 * Creates instance.
	 *
	 * @return \A8C\FSE\Posts_List_Block
	 */
	public static function get_instance() {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}

		return self::$instance;
	}

	/**
	 * Enqueue block editor scripts.
	 */
	public function enqueue_scripts() {
		if ( ! has_block( 'a8c/posts-list' ) ) {
			return;
		}
		use_webpack_assets( 'posts-list-block', array( 'exclude_style' => true ) );
	}

	/**
	 * Enqueue block styles.
	 */
	public function enqueue_styles() {
		if ( ! has_block( 'a8c/posts-list' ) ) {
			return;
		}

		use_webpack_assets( 'posts-list-block', array( 'exclude_script' => true ) );
	}

	/**
	 * Register block.
	 */
	public function register_blocks() {
		register_block_type(
			'a8c/posts-list',
			array(
				'attributes'      => array(
					'postsPerPage' => array(
						'type'    => 'number',
						'default' => 10,
					),
				),
				'render_callback' => array( $this, 'render_a8c_post_list_block' ),
			)
		);
	}

	/**
	 * Renders posts list.
	 *
	 * @param array  $attributes Block attributes.
	 * @param string $content    Block content.
	 * @return string
	 */
	public function render_a8c_post_list_block( $attributes, $content ) {

		$posts_list = new \WP_Query(
			array(
				'post_type'        => 'post',
				'posts_per_page'   => $attributes['postsPerPage'],
				'post_status'      => 'publish',
				'suppress_filters' => false,
			)
		);

		add_filter( 'excerpt_more', array( $this, 'custom_excerpt_read_more' ) );

		// Prevent situations when the block attempts rendering another a8c/posts-list block.
		if ( true !== $this->rendering_block ) {
			$this->rendering_block = true;

			$content = render_template(
				'posts-list',
				array(
					'posts_list' => $posts_list,
				)
			);

			$this->rendering_block = false;
		}

		remove_filter( 'excerpt_more', array( $this, 'custom_excerpt_read_more' ) );

		// Reset the custom query.
		wp_reset_postdata();

		return $content;
	}

	/**
	 * Excerpt more string.
	 *
	 * @return string More string.
	 */
	public function custom_excerpt_read_more() {
		return sprintf(
			'&hellip; <a href="%1$s" title="%2$s" class="a8c-posts-list-item__read-more">%3$s</a>',
			esc_url( get_the_permalink() ),
			sprintf(
				/* translators: %s: Name of current post */
				esc_attr__( 'Continue reading %s', 'full-site-editing' ),
				the_title_attribute( array( 'echo' => false ) )
			),
			esc_html__( 'Read more', 'full-site-editing' )
		);
	}
}
