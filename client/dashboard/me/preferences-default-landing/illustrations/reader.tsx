/**
 * SVG illustration for the "Reader" landing page option.
 * Depicts a reading interface with sidebar navigation and post cards.
 */
export default function ReaderIllustration() {
	return (
		<svg viewBox="0 0 200 100" fill="none" xmlns="http://www.w3.org/2000/svg">
			<rect width="200" height="100" fill="#f0f0f0" />
			<rect x="10" y="10" width="29" height="8" rx="2" fill="#1e1e1e" fillOpacity="0.5" />
			<rect x="10" y="24" width="40" height="44" rx="3" fill="white" />
			<rect x="10.5" y="24.5" width="39" height="43" rx="2.5" stroke="#ddd" />
			<rect x="60" y="10" width="130" height="80" rx="3" fill="white" />
			<rect x="60.5" y="10.5" width="129" height="79" rx="2.5" stroke="#ddd" />
			<g clipPath="url(#reader-clip)">
				<rect x="83" y="18" width="84" height="44" rx="5" fill="#1e1e1e" fillOpacity="0.05" />
				<rect x="83" y="68" width="84" height="44" rx="5" fill="#1e1e1e" fillOpacity="0.05" />
			</g>
			<rect x="10" y="76" width="2.41667" height="2" rx="1" fill="#1e1e1e" fillOpacity="0.1" />
			<rect x="14.833" y="76" width="24.1667" height="2" rx="1" fill="#1e1e1e" fillOpacity="0.1" />
			<rect x="10" y="82" width="2.41667" height="2" rx="1" fill="#1e1e1e" fillOpacity="0.1" />
			<rect x="15" y="82" width="20" height="2" rx="1" fill="#1e1e1e" fillOpacity="0.1" />
			<rect x="10" y="88" width="2.41667" height="2" rx="1" fill="#1e1e1e" fillOpacity="0.1" />
			<rect x="15" y="88" width="28" height="2" rx="1" fill="#1e1e1e" fillOpacity="0.1" />
			<defs>
				<clipPath id="reader-clip">
					<rect width="84" height="71" fill="white" transform="translate(83 18)" />
				</clipPath>
			</defs>
		</svg>
	);
}
