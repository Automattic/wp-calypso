<?php //phpcs:ignore WordPress.Files.FileName.InvalidClassFileName
namespace A8C\FSE\Mailerlite;

/**
 * Mailerlite widget class
 * Display a subscriber popup for Mailerlite.
 */
class WPCOM_Widget_Mailerlite extends \WP_Widget {

	/**
	 * WPCOM_Widget_Mailerlite constructor.
	 */
	public function __construct() {
		parent::__construct(
			'wpcom-mailerlite',
			/** This filter is documented in modules/widgets/facebook-likebox.php */
			apply_filters( 'jetpack_widget_name', __( 'Mailerlite subscriber popup', 'full-site-editing' ) ),
			array(
				'classname'                   => 'widget_mailerlite',
				'description'                 => __( 'Display Mailerlite subscriber popup', 'full-site-editing' ),
				'customize_selective_refresh' => true,
			)
		);
	}

	/**
	 * Output the widget.
	 *
	 * @param array $args Display arguments including 'before_title', 'after_title', 'before_widget', and 'after_widget'.
	 * @param array $instance - The settings for the particular instance of the widget.
	 */
	public function widget( $args, $instance ) {
		/** This action is documented in modules/widgets/gravatar-profile.php */
		do_action( 'jetpack_stats_extra', 'widget_view', 'mailerlite' );

		if ( empty( $instance['account'] ) || empty( $instance['uuid'] ) ) {
			if ( current_user_can( 'edit_theme_options' ) ) {
				echo $args['before_widget']; //phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
				echo '<p>' . sprintf(
					wp_kses(
						/* translators: %1$s - URL to manage the widget, %2$s - documentation URL. */
						__( 'You need to enter your numeric account ID and UUID for the <a href="%1$s">Mailerlite Widget</a> to work correctly. <a href="%2$s" target="_blank">Full instructions</a>.', 'full-site-editing' ),
						array(
							'a' => array(
								'href'  => array(),
								'title' => array(),
							),
						)
					),
					esc_url( admin_url( 'widgets.php' ) ),
					'https://wordpress.com/support/widgets/mailerlite/'
				) . '</p>';
				echo $args['after_widget']; //phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
			}
			return;
		}

		if ( wp_script_is( 'mailerlite-subscriber-popup', 'enqueued' ) ) {
			return;
		}

		wp_register_script( 'mailerlite-universal', 'https://static.mailerlite.com/js/universal.js', array(), '20200521', true );
		wp_enqueue_script(
			'mailerlite-subscriber-popup',
			plugins_url( 'subscriber-popup.js', __FILE__ ),
			array( 'mailerlite-universal' ),
			'20200521',
			true
		);
		wp_localize_script(
			'mailerlite-subscriber-popup',
			'jetpackMailerliteSettings',
			array(
				'account' => esc_attr( $instance['account'] ),
				'uuid'    => esc_attr( $instance['uuid'] ),
			)
		);

	}

	/**
	 * Updates a particular instance of a widget.
	 *
	 * @param array $new_instance New settings for this instance as input by the user via WP_Widget::form().
	 * @param array $old_instance   Old settings for this instance.
	 *
	 * @return mixed
	 */
	public function update( $new_instance, $old_instance ) { // @phpcs:ignore VariableAnalysis.CodeAnalysis.VariableAnalysis.UnusedVariable
		return array(
			'account' => wp_kses( stripslashes( $new_instance['account'] ), array() ),
			'uuid'    => wp_kses( stripslashes( $new_instance['uuid'] ), array() ),
		);
	}

	/**
	 * Editable form in WP-admin.
	 *
	 * @param array $instance - settings.
	 */
	public function form( $instance ) {
		$instance = wp_parse_args(
			(array) $instance,
			array(
				'account' => '',
				'uuid'    => '',
			)
		);

		echo '
		<p><label for="' . esc_attr( $this->get_field_id( 'account' ) ) . '">';
		/* translators: link to documentation */
		printf( wp_kses_post( __( 'Account ID <a href="%s" target="_blank">(instructions)</a>:', 'full-site-editing' ) ), 'https://wordpress.com/support/widgets/mailerlite/' );
		echo '<input class="widefat" id="' . esc_attr( $this->get_field_id( 'account' ) ) . '" name="' . esc_attr( $this->get_field_name( 'account' ) ) . '" type="text" value="' . esc_attr( $instance['account'] ) . '" />
		</label></p>
		<p><label for="' . esc_attr( $this->get_field_id( 'shelf' ) ) . '">' . esc_html__( 'UUID:', 'full-site-editing' );
		echo '<input class="widefat" id="' . esc_attr( $this->get_field_id( 'uuid' ) ) . '" name="' . esc_attr( $this->get_field_name( 'uuid' ) ) . '" type="text" value="' . esc_attr( $instance['uuid'] ) . '" />';
		echo '</label></p>
		';
	}
}

/**
 * Registers the widget via widgets_init hook.
 */
function mailerlite_register_widget() {
	register_widget( '\A8C\FSE\Mailerlite\WPCOM_Widget_Mailerlite' );
}
add_action( 'widgets_init', '\A8C\FSE\Mailerlite\mailerlite_register_widget' );
