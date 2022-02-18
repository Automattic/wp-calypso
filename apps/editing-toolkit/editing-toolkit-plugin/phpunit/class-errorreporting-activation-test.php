<?php
/**
 * Error Reporting Activation Test File.
 *
 * Unit-tests the Sentry/homebrew error reporting activation logic.
 * This test file should be ephemeral and will be removed once we
 * decide which solution to use.
 *
 * The rest of the error reporting module is easier to test manually,
 * and harder (and probably not worth the time and effort) to write
 * automated tests for. In fact, if we choose to use Sentry, then
 * it'll pretty much only add a snippet (maybe with some additional
 * conditional logic for WoA).
 *
 * I think this provides for a good pragmatic balance in giving
 * us confidence. -Marcelo.
 *
 * @package full-site-editing-plugin
 */

namespace A8C\FSE\ErrorReporting;

use PHPUnit\Framework\TestCase;

// Stub for the `is_automattician` function is in `bootstrap.php`.
// See comments there for more info.

/**
 * Stub for the has_blog_sticker function
 *
 * @param noop $sticker Not used.
 * @param int  $blog_id The blog id.
 */
function has_blog_sticker( $sticker, $blog_id ) {
	if ( 7731 === $blog_id ) {
		return true;
	}
	if ( 7732 === $blog_id ) {
		return false;
	}
}

/**
 * Class ErrorReporting_Activation_Test
 */
class ErrorReporting_Activation_Test extends TestCase {
	/**
	 * This should match the pct in `user_in_sentry_test_segment()` in
	 * `../error-reporting/index.php`
	 *
	 * @var int $current_segment
	 */
	private $current_segment = 10;
	/**
	 * A dummy id that represents an a11n user. It's used in the `is_automattician`
	 * stub defined above.
	 *
	 * @var int $a11n_user_id
	 */
	private $a11n_user_id = 8898;
	/**
	 * A dummy id that represents an a11n user that would fall in the segment.
	 * It's used in the `is_automattician` stub defined above.
	 *
	 * @var int $a11n_user_id
	 */
	private $a11n_user_id_in_segment = 8808;
	/**
	 * A dummy id that represents a regular non-a11n user.
	 *
	 * @var int $a11n_user_id
	 */
	private $regular_user_id = 6600;
	/**
	 * A dummy id that represents an a11n user. It's used in the `is_automattician`
	 * stub defined above.
	 *
	 * The sticker we're faking here is the `error-reporting-use-sentry`.
	 * See: https://github.com/Automattic/wp-calypso/pull/54257.
	 *
	 * @var int $blog_with_sticker_id
	 */
	private $blog_with_sticker_id = 7731;

	/**
	 * A dummy id that represents an blog that has a sticker. It's used in the
	 * `has_blog_sticker` defined above.
	 *
	 * @var int $blog_without_sticker_id
	 */
	private $blog_without_sticker_id = 7732;
	/**
	 * Represents a blog id we don't care about.Communicates that the id is not
	 * really relevant in the given test context
	 *
	 * @var int $blog_noop_id
	 */
	private $blog_noop_id = 7733;

	/**
	 * Tests that the `should_activate_sentry` function returns `true` for an a11n
	 * user id if the current blog has the sticker applied.
	 */
	public function test_should_activate_sentry_is_true_if_a11n_with_sticker() {
		$this->assertTrue( should_activate_sentry( $this->a11n_user_id, $this->blog_with_sticker_id ) );
	}

	/**
	 * Tests that the `should_activate_sentry` function returns `false` for an a11n
	 * user id if the current blog does not have the sticker applied.
	 */
	public function test_should_activate_sentry_is_false_if_a11n_without_sticker() {
		$this->assertFalse( should_activate_sentry( $this->a11n_user_id, $this->blog_without_sticker_id ) );
	}

	/**
	 * Tests that the `should_activate_sentry` function returns `false` for an a11n
	 * user that tested false for the sentry sticker but accidentally falls in the
	 * test segment. A12s without the sticker that fall in the segment should not
	 * have Sentry activated.
	 */
	public function test_should_activate_sentry_is_false_if_a11n_without_sticker_and_in_sentry_segment() {
		$this->assertFalse( should_activate_sentry( $this->a11n_user_id_in_segment, $this->blog_without_sticker_id ) );
	}

	/**
	 * Tests that the `should_activate_sentry` function returns `true` for the ids that fall
	 * inside the segment.
	 */
	public function test_should_activate_sentry_is_true_if_regular_user_in_sentry_segment() {
		for ( $i = $this->regular_user_id; $i < $this->regular_user_id + $this->current_segment; $i++ ) {
			$this->assertTrue( should_activate_sentry( $i, $this->blog_noop_id ) );
		}
	}
	/**
	 * Tests that the `should_activate_sentry` function returns `false` for the ids that fall outside
	 * the test segment.
	 */
	public function test_should_activate_sentry_is_false_if_regular_user_outside_sentry_segment() {
		for ( $i = $this->regular_user_id + $this->current_segment; $i <= $this->regular_user_id + 99; $i++ ) {
			$this->assertFalse( should_activate_sentry( $i, $this->blog_noop_id ) );
		}
	}
}
