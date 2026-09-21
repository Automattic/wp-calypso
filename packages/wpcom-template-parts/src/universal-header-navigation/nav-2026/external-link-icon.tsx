// Marks links that leave WordPress.com. Rendered inside the link label, so the
// leading nbsp keeps it from orphaning onto its own line in longer locales.
export function Nav2026ExternalLinkIcon() {
	return (
		<span className="x-nav__external-link-icon">
			&nbsp;
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 12 12"
				className="x-icon x-icon--external"
				role="presentation"
				aria-hidden="true"
			>
				<path d="M4 2h6v6H8.5V4.56L3.03 10.03 1.97 8.97 7.44 3.5H4z" />
			</svg>
		</span>
	);
}
