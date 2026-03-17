<?php
/**
 * Search form input for support search card.
 *
 * Accepted $args:
 *   form_id             - id attribute for the <form> (default: 'support-search-form')
 *   form_class          - class attribute for the <form> (default: '')
 *   input_id            - id attribute for the <input> (default: 'support-search-input')
 *   input_class         - class attribute for the <input> (default: '')
 *   placeholder         - placeholder text for the <input> (default: 'Search questions, guides, courses')
 *   enable_odie_answers - bool, render odie/AI variant instead of standard search (default: false)
 *
 * @package happy-blocks
 */

if ( ! isset( $args ) ) {
	$args = array();
}

$form_id             = $args['form_id'];
$form_class          = $args['form_class'];
$input_id            = $args['input_id'];
$input_class         = $args['input_class'];
$placeholder         = $args['placeholder'];
$enable_odie_answers = $args['enable_odie_answers'];
?>
<fieldset class="support-search-form-container">
	<form id="<?php echo esc_attr( $form_id ); ?>" class="<?php echo esc_attr( $form_class ); ?>" role="search" method="get" action="">
		<div class="input-wrapper" dir="auto">
			<?php if ( $enable_odie_answers ) : ?>
				<input id="<?php echo esc_attr( $input_id ); ?>" type="input" name="odie-query"<?php echo $input_class ? ' class="' . esc_attr( $input_class ) . '"' : ''; ?> placeholder="<?php echo esc_attr( $placeholder ); ?>"/>
				<button type="submit" class="search-submit-button button-primary" aria-label="<?php echo esc_attr( __( 'Search', 'happy-blocks' ) ); ?>">
					<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
						<path d="M12.2197 5C12.4186 5 12.6094 5.07902 12.75 5.21967L17 9.46967C17.2929 9.76256 17.2929 10.2374 17 10.5303C16.7071 10.8232 16.2322 10.8232 15.9393 10.5303L12.9697 7.56067V18.25C12.9697 18.6642 12.6339 19 12.2197 19C11.8055 19 11.4697 18.6642 11.4697 18.25V7.56065L8.5 10.5303C8.2071 10.8232 7.73223 10.8232 7.43934 10.5303C7.14644 10.2374 7.14645 9.76256 7.43934 9.46967L11.6894 5.21967C11.83 5.07902 12.0208 5 12.2197 5Z" fill="currentColor"/>
					</svg>
				</button>
			<?php else : ?>
				<input id="<?php echo esc_attr( $input_id ); ?>" type="search" name="s"<?php echo $input_class ? ' class="' . esc_attr( $input_class ) . '"' : ''; ?> placeholder="<?php echo esc_attr( $placeholder ); ?>"/>
				<button type="submit" class="search-submit-button" aria-label="<?php echo esc_attr( __( 'Search', 'happy-blocks' ) ); ?>">
					<svg xmlns="http://www.w3.org/2000/svg" class="search-icon" width="24" height="24" viewBox="0 0 24 24" fill="none">
						<path d="M13 5C9.7 5 7 7.7 7 11C7 12.4 7.5 13.7 8.3 14.7L4.5 18.5L5.6 19.6L9.4 15.8C10.4 16.6 11.7 17.1 13.1 17.1C16.4 17.1 19.1 14.4 19.1 11.1C19.1 7.8 16.3 5 13 5ZM13 15.5C10.5 15.5 8.5 13.5 8.5 11C8.5 8.5 10.5 6.5 13 6.5C15.5 6.5 17.5 8.5 17.5 11C17.5 13.5 15.5 15.5 13 15.5Z"/>
					</svg>
				</button>
				<?php endif; ?>
		</div>
	</form>

	<ul class="search-terms">
		<li><button data-search-query="<?php echo esc_attr( __( 'Connect a domain', 'happy-blocks' ) ); ?>" href="<?php echo esc_url( get_support_search_link_for_query( 'connect a domain' ) ); ?>"><?php echo esc_html( __( 'Connect a domain', 'happy-blocks' ) ); ?></button></li>
		<li><button data-search-query="<?php echo esc_attr( __( 'Upgrade my plan', 'happy-blocks' ) ); ?>" href="<?php echo esc_url( get_support_search_link_for_query( 'upgrade my plan' ) ); ?>"><?php echo esc_html( __( 'Upgrade my plan', 'happy-blocks' ) ); ?></button></li>
		<li><button data-search-query="<?php echo esc_attr( __( 'Add email', 'happy-blocks' ) ); ?>" href="<?php echo esc_url( get_support_search_link_for_query( 'add email' ) ); ?>"><?php echo esc_html( __( 'Add email', 'happy-blocks' ) ); ?></button></li>
		<li><button data-search-query="<?php echo esc_attr( __( 'Reset my password', 'happy-blocks' ) ); ?>" href="<?php echo esc_url( get_support_search_link_for_query( 'reset my password' ) ); ?>"><?php echo esc_html( __( 'Reset my password', 'happy-blocks' ) ); ?></button></li>
	</ul>
</fieldset>
