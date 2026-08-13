// Marks links that leave WordPress.com. Rendered inside the link label, so the
// leading nbsp keeps it from orphaning onto its own line in longer locales.
export function Nav2026ExternalLinkIcon() {
	return (
		<span className="x-nav__external-link-icon">
			&nbsp;
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 9 9"
				className="x-icon x-icon--external"
				role="presentation"
				aria-hidden="true"
			>
				<path d="M5.5 0v1h1.795L2.38 5.915l.705.705L8 1.705V3.5h1V0H5.5zM8 8H1V1h3V0H1a1 1 0 00-1 1v7a1 1 0 001 1h7a1 1 0 001-1V5H8v3z" />
			</svg>
		</span>
	);
}
