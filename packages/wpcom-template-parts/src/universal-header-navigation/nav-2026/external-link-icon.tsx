// Marks links that leave WordPress.com with the footer's ↗ glyph. The leading nbsp
// keeps it on the label's last line instead of orphaning onto its own.
export function Nav2026ExternalLinkIcon() {
	return (
		<span className="x-nav__external-link-icon" aria-hidden="true">
			&nbsp;↗
		</span>
	);
}
