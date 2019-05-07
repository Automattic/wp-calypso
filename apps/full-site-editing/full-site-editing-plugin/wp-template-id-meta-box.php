<?php

class A8C_WP_Template_Id_Meta_Box {
	static $initialized = false;
	private $post_types_using_templates = array( 'page', 'post' );

	function __construct() {
		if ( self::$initialized ) {
			return;
		}
		self::$initialized = true;

		add_action( 'init', array( $this, 'register_meta_template_id' ) );
		add_action( 'add_meta_boxes', array( $this, 'add_meta_template_id' ) );
		add_action( 'save_post', array( $this, 'save_meta_template_id' ) );
	}

	function register_meta_template_id() {
		foreach( $this->post_types_using_templates as $post_type ) {
			register_meta( $post_type, 'wp_template_id', array(
				'show_in_rest' => true,
				'single' => true,
				'type' => 'integer',
			) );
		}
	}

	function add_meta_template_id() {
		foreach( $this->post_types_using_templates as $post_type ) {
			add_meta_box(
				'wp_template_id_meta_box',
				__( 'Template' ),
				array( $this, 'render_wp_template_id_meta_box' ),
				$post_type,
				'side'
			);
		}
	}

	function render_wp_template_id_meta_box( $post ) {
		wp_nonce_field( basename( __FILE__ ), 'wp_template_id_nonce' );
		$template_id = get_post_meta( $post->ID, 'wp_template_id', true );
		$posts = get_posts( array(
			'posts_per_page' => -1,
			'post_type' => 'wp_template',
		) );
		?>
			<p>
				<label for="wp_template_id"><?php _e( 'Select a template' ); ?></label>
				<select id="wp_template_id" name="wp_template_id">
					<option value=""></option>
					<?php foreach( $posts as $post ) { ?>
						<option
							value="<?php echo $post->ID; ?>"
							<?php selected( $post->ID, $template_id ) ?>
						>
							<?php echo $post->post_title; ?>
						</option>
					<?php } ?>
				</select>
			</p>
		<?php
	}

	function save_meta_template_id( $post_id ) {
		if (
			! isset( $_POST['wp_template_id_nonce'] ) ||
			! wp_verify_nonce( $_POST['wp_template_id_nonce'], basename( __FILE__ ) )
		) {
			return;
		}

		update_post_meta( $post_id, 'wp_template_id', sanitize_text_field( $_POST['wp_template_id'] ) );
	}
}
