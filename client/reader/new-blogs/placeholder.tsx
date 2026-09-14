/**
 * Same shape as OonRecCard, shown while a rec's post is being hydrated so the
 * block keeps its height and the feed below doesn't jump. Follows the Reader
 * placeholder pattern (recommended-sites/placeholder, stream/post-placeholder):
 * real layout, `is-placeholder` classes, `placeholder()` mixin for the pulse.
 */
export default function OonRecCardPlaceholder() {
	return (
		<li className="reader-discover-new-blogs__card is-placeholder" aria-hidden="true">
			<div className="reader-discover-new-blogs__card-head">
				<div className="reader-discover-new-blogs__site">
					<span className="reader-discover-new-blogs__site-icon is-placeholder" />
					<span className="reader-discover-new-blogs__site-name is-placeholder">Site name</span>
				</div>
				<div className="reader-discover-new-blogs__card-actions">
					<span className="reader-discover-new-blogs__subscribe is-placeholder">Subscribe</span>
					<span className="reader-discover-new-blogs__dismiss is-placeholder" />
				</div>
			</div>
			<h3 className="reader-discover-new-blogs__title is-placeholder">Loading a post title</h3>
			<div className="reader-discover-new-blogs__excerpt is-placeholder">
				<p>Loading the excerpt of the post, it should not take long.</p>
				<p>Second line of the excerpt.</p>
			</div>
		</li>
	);
}
