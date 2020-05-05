<?php declare( strict_types = 1 );

namespace A8C\FSE\EarnDev\SubscriptionService;

use A8C\FSE\EarnDev\SubscriptionService\Mock_SubscriptionService;
use WP_REST_Response;

final class Paywall_Response extends WP_REST_Response {


	/**
	 * @param string $content
	 */
	function __construct( $content ) {
		parent::__construct( $content, 200, array( 'Content-Type' => 'text/html' ) );
	}

	/**
	 * @param  \WP_REST_Request $request
	 * @return self
	 */
	public static function challenge( $request ) {
		$redirect_uri        = rawurldecode( $request->get_param( 'redirect_uri' ) ?? '' );
		$redirect_with_token = add_query_arg( Mock_SubscriptionService::TOKEN_QUERY_NAME, 'subscriber', $redirect_uri );
		$subscribed_url      = esc_attr( $redirect_with_token );
		$abort_url           = esc_attr( $redirect_uri );
		$redirect_token_uri  = esc_html__( $redirect_with_token );
		return new self(
			<<<HTML
			<!DOCTYPE html>
			<html>
				<head>
					<title>Subscribe</title>
					<script type="text/javascript">
						console.log('hello');
					</script>
					<style type="text/css">
					body {
						display: flex;
						flex-direction: column;
						margin: 0;
						padding: 32px;
						align-items: center;
						font-family: Helvetica;
					}

					a {
						text-decoration: none;
						padding: 10px;
						border-radius: 5px;
						color: hsl(200, 50%, 90%);
						background: linear-gradient(hsl(200, 50%, 50%), hsl(200, 50%, 60%))
					}

					a:hover {
						color: hsl(200, 50%, 100%);
						background: linear-gradient(hsl(200, 65%, 70%), hsl(200, 50%, 55%))
					}

					a:active {
						background: linear-gradient(hsl(200, 50%, 55%), hsl(200, 50%, 65%))
					}
					</style>
				</head>
				<body>
					<a href="$subscribed_url">Subscribe</a>

					<a href="$abort_url">No thanks!</a>

					<table>
						<tr>
							<th>Redirect URI</th>
							<td>
								$redirect_token_uri
							</td>
						</tr>
					</table>
				</body>
			</html>
			HTML
		);
	}

	/**
	 * @param  boolean          $is_served
	 * @param  WP_REST_Response $response
	 * @return boolean
	 */
	public static function rest_pre_serve_request( $is_served, $response ) {
		if ( $is_served ) {
			return true;
		}

		if ( ! $response instanceof Paywall_Response ) {
			return false;
		}

		echo $response->get_data();
		return true;
	}
}
