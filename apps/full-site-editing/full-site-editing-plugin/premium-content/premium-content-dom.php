<?php declare( strict_types = 1 );

namespace A8C\FSE\Earn\PremiumContent;

/**
 * Class Premium_Content_Dom
 *
 * Manipulate an HTML string.
 *
 * @package Automattic\Earn\PremiumContent
 */
class Premium_Content_Dom {

	const SUBSCRIBER_VIEW_CLASS    = 'wp-block-premium-content-subscriber-view';
	const LOGGED_OUT_VIEW_CLASS    = 'wp-block-premium-content-logged-out-view';
	const LOGGED_OUT_BUTTONS_CLASS = 'wp-block-premium-content-logged-out-view__buttons';

	/**
	 * @var \DOMDocument
	 */
	private $doc;

	/**
	 * Premium_Content_Dom constructor.
	 *
	 * @param string $content HTML
	 */
	function __construct( $content ) {
		$this->doc = new \DOMDocument();
		libxml_use_internal_errors( true );
		// Do not set doctype, html, or body tags
		$status = $this->doc->loadHTML( $content, LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD );
		if ( $status === false ) {
			throw new \InvalidArgumentException( 'Unable to load HTML' );
		}
	}

	/**
	 * @param string $class
	 *
	 * @return $this
	 * @throws \Exception
	 */
	public function remove_element_by_class( string $class ) {
		$xpath    = new \DOMXPath( $this->doc );
		$elements = $xpath->query( "//*[contains(concat(' ', normalize-space(@class), ' '), ' $class ')]" );
		if ( empty( $elements ) ) {
			throw new \Exception( 'problem parsing the query' );
		}
		for ( $i = $elements->length; --$i >= 0; ) {
			$element = $elements->item( $i );
         // phpcs:ignore WordPress.NamingConventions.ValidVariableName.UsedPropertyNotSnakeCase
			$element->parentNode->removeChild( $element );
		}
		return $this;
	}

	/**
	 * @return string
	 */
	public function to_html() {
		return utf8_decode( $this->doc->saveHTML() );
	}

	/**
	 * Remove the subscription div.
	 *
	 * @param string $content
	 *
	 * @return string
	 */
	public static function logged_out( string $content ) {
		try {
			$dom = new Premium_Content_Dom( $content );
			return $dom
				->remove_element_by_class( self::SUBSCRIBER_VIEW_CLASS )
				->to_html();
		} catch ( \Exception $exception ) {
			return $content;
		}
	}

	/**
	 * Remove the logged out view
	 *
	 * @param string $content
	 *
	 * @return string
	 */
	public static function subscriber( string $content ) {
		try {
			$dom = new Premium_Content_Dom( $content );
			return $dom
				->remove_element_by_class( self::LOGGED_OUT_VIEW_CLASS )
				->remove_element_by_class( self::LOGGED_OUT_BUTTONS_CLASS )
				->to_html();
		} catch ( \Exception $exception ) {
			return $content;
		}
	}
}
