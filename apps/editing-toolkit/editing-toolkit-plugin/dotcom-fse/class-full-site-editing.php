<?php
/**
 * Full site editing file.
 *
 * @package A8C\FSE
 */

namespace A8C\FSE;

/**
 * Class Full_Site_Editing
 */
class Full_Site_Editing {
	/**
	 * Class instance.
	 *
	 * @var \A8C\FSE\Full_Site_Editing
	 */
	private static $instance = null;

	/**
	 * Current theme slug.
	 *
	 * @var string
	 */
	private $theme_slug = '';

	/**
	 * Instance of WP_Template_Inserter class.
	 *
	 * @var WP_Template_Inserter
	 */
	public $wp_template_inserter;

	/**
	 * Full_Site_Editing constructor.
	 */
	private function __construct() {
		add_action( 'init', array( $this, 'register_blocks' ), 100 );
		add_action( 'init', array( $this, 'register_template_post_types' ) );

		$this->theme_slug           = normalize_theme_slug( get_stylesheet() );
		$this->wp_template_inserter = new WP_Template_Inserter( $this->theme_slug );
	}

	/**
	 * Creates instance.
	 *
	 * @return \A8C\FSE\Full_Site_Editing
	 */
	public static function get_instance() {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}

		return self::$instance;
	}

	/**
	 * Register post types.
	 */
	public function register_template_post_types() {
		$this->wp_template_inserter->register_template_post_types();
	}

	/**
	 * Register blocks.
	 */
	public function register_blocks() {
		register_block_type(
			'a8c/navigation-menu',
			array(
				'attributes'      => array(
					'className'             => array(
						'type'    => 'string',
						'default' => '',
					),
					'align'                 => array(
						'type'    => 'string',
						'default' => 'wide',
					),
					'textAlign'             => array(
						'type'    => 'string',
						'default' => 'center',
					),
					'textColor'             => array(
						'type' => 'string',
					),
					'customTextColor'       => array(
						'type' => 'string',
					),
					'backgroundColor'       => array(
						'type' => 'string',
					),
					'customBackgroundColor' => array(
						'type' => 'string',
					),
					'fontSize'              => array(
						'type'    => 'string',
						'default' => 'normal',
					),
					'customFontSize'        => array(
						'type' => 'number',
					),
				),
				'render_callback' => __NAMESPACE__ . '\render_navigation_menu_block',
			)
		);

		register_block_type(
			'a8c/post-content',
			array(
				'render_callback' => __NAMESPACE__ . '\render_post_content_block',
			)
		);

		register_block_type(
			'a8c/site-description',
			array(
				'render_callback' => __NAMESPACE__ . '\render_site_description_block',
			)
		);

		register_block_type(
			'a8c/template',
			array(
				'render_callback' => __NAMESPACE__ . '\render_template_block',
			)
		);

		register_block_type(
			'a8c/site-title',
			array(
				'render_callback' => __NAMESPACE__ . '\render_site_title_block',
			)
		);
	}

}
