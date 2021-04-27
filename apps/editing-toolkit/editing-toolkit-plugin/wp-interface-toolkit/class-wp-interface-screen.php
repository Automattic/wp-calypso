<?php

class WP_Interface_Screen {

	protected $screen_replacer;

	public function __construct( $slug, $opts ) {
		$this->slug = $slug;
		$this->opts = $this->parse_opts( $opts );

		add_action( 'admin_menu', [ $this, 'register_admin_menu' ] );
		add_action( 'admin_enqueue_scripts', [ $this, 'init_scripts' ] );
	}

	public function parse_opts( $opts ) {
		$defaults = [
			'page_title' => $this->slug,
			'capability' => 'manage_options',
			'function' => [ $this, 'admin_page_callback'],
			'icon_url' => '',
			'postition' => null,
			'replace' => false,
			'data_callback' => '',
			'rest_preload_paths' => [],
			'script_dir' => '',
			'script_slug' => 'index',
			'enqueue_callback' => '',
		];
		$opts = wp_parse_args( $opts, $defaults );
		if ( ! isset( $opts['menu_title'] ) ) {
			$opts['menu_title'] = $opts['page_title'];
		}
		return $opts;
	}

	public function init_scripts( $hook = '' ) {
		if ( ! $this->is_screen( $hook ) ) {
			return;
		}

		$script_url = $this->get_script_url();
		$preload_paths = $this->opts['rest_preload_paths'];
		$script_slug = esc_attr( 'wit-script-' . $this->slug );
		// camelcase it
		$script_slug = lcfirst( str_replace( '-', '', ucwords( $script_slug, '-' ) ) );
		$script_data_variable = esc_js( $script_slug . 'Data' );
		$script_assets = $this->get_script_assets();
		$script_data = $this->get_script_data();

		wp_enqueue_script( $script_slug, $script_url, $script_assets['dependencies'], $script_assets['version'] );
		wp_localize_script( $script_slug, $script_data_variable, $script_data );
		wp_enqueue_style( 'wp-components' );

		if ( is_callable( $this->opts['enqueue_callback'] ) ) {
			call_user_func( $this->opts['enqueue_callback'] );
		}
	}

	protected function get_script_data() {
		$data = false;
		if ( is_callable( $this->opts['data_callback'] ) ) {
			$data = call_user_func( $this->opts['data_callback'] );
		}
		return $data;
	}

	protected function get_script_slug() {
		return $this->opts['script_slug'];
	}

	protected function get_script_dir() {
		// We are assuming that we will used the `dist` directory from `wp-scripts` for the built JS and its assets PHP file
		return trailingslashit( $this->opts['script_dir'] ) . 'dist/';
	}

	protected function get_script_url() {
		$path = sprintf( '/dist/%s.js', $this->get_script_slug() );
		return plugins_url( $path, $this->get_script_dir() );
	}

	protected function get_script_assets() {
		$file = sprintf(
			'%s%s.asset.php',
			$this->get_script_dir(),
			$this->get_script_slug()
		);
		// @todo should we guard against errors or leave it this way to make sure people get it right?
		return require( $file );
	}
	protected function get_script_deps() {
		$scripts = [ 'wp-components', 'wp-element' ];
		if ( isset( $this->opts['script_dependencies'] ) && is_array( $this->opts['script_dependencies'] ) ) {
			$scripts = array_merge( $scripts, $this->opts['script_dependencies'] );
		}
		return $scripts;
	}

	protected function is_screen( $hook ) {
		$parts = explode( '_', $hook );
		$slug_to_compare = array_pop( $parts );
		return $this->slug === $slug_to_compare;
	}

	public function register_admin_menu() {
		add_menu_page(
			$this->opts['page_title'],
			$this->opts['menu_title'],
			$this->opts['capability'],
			$this->slug,
			$this->opts['function'],
			$this->opts['icon_url'],
			$this->opts['position']
		);

		if ( $this->opts['replace'] ) {
			if ( ! class_exists( 'WP_Interface_Screen_Replacer') ) {
				require __DIR__ . '/class-wp-interface-screen-replacer.php';
			}
			$this->screen_replacer = new WP_Interface_Screen_Replacer( $this->slug, $this->opts['replace'], $this->opts['menu_title'] );
		}
	}

	public function admin_page_callback() {
		echo '<div id="wit-root"></div>';
	}
}