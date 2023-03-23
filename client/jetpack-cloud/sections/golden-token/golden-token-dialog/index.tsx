import JetpackLogo from 'calypso/components/jetpack-logo';

export const GoldenTokenDialog = () => {
	return (
		<div>
			<JetpackLogo />
			{ /* eslint-disable-next-line jsx-a11y/media-has-caption */ }
			<video>
				<source
					// TODO: this video needs to be hosted on something official
					src="https://dev.keoshi.com/jetpack/golden-token/jetpack-golden-token-01.mp4"
					type="video/mp4"
				/>
			</video>

			<div>
				<div className="golden-token-dialog__redeem">
					<p>Hey, [user name]</p>
					<h2>Your exclusive Jetpack Experience&nbsp;awaits</h2>
					<p>
						You have been gifted a Jetpack Gold Token. This unlocks a lifetime of Jetpack powers for
						your website.
					</p>
				</div>
				<button>Redeem your token</button>
			</div>

			<div className="golden-token-dialog__products">
				<div>
					{ /* TODO: switch for Backup icon */ }
					{ /* <svg
						width="24"
						height="24"
						viewBox="0 0 24 24"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<mask
							id="mask0_3274_17235"
							style="mask-type: alpha;"
							maskUnits="userSpaceOnUse"
							x="4"
							y="5"
							width="16"
							height="12"
						>
							<path
								fill-rule="evenodd"
								clip-rule="evenodd"
								d="M17.3331 10.1123C17.3332 10.0972 17.3333 10.082 17.3333 10.0667C17.3333 7.6367 15.1843 5.66675 12.5333 5.66675C10.2955 5.66675 8.41542 7.07048 7.88371 8.96976C7.83383 8.96773 7.7837 8.9667 7.73333 8.9667C5.67147 8.9667 4 10.6904 4 12.8167C4 14.943 5.67147 16.6667 7.73333 16.6667L7.75555 16.6666H16.7819C16.7878 16.6667 16.7937 16.6667 16.7996 16.6667C18.5669 16.6667 19.9996 15.1892 19.9996 13.3667C19.9996 11.7316 18.8465 10.3742 17.3331 10.1123Z"
								fill="white"
							/>
						</mask>
						<g mask="url(#mask0_3274_17235)">
							<path
								d="M17.3331 10.1123L15.8332 10.0957L15.8191 11.3726L17.0773 11.5904L17.3331 10.1123ZM7.88371 8.96976L7.82248 10.4685L9.00824 10.517L9.32817 9.37414L7.88371 8.96976ZM7.73333 16.6667V18.1667H7.73784L7.73333 16.6667ZM7.75555 16.6666V15.1666H7.75105L7.75555 16.6666ZM16.7819 16.6666L16.7904 15.1666H16.7819V16.6666ZM18.833 10.1289C18.8332 10.1083 18.8333 10.0875 18.8333 10.0667H15.8333C15.8333 10.0764 15.8333 10.0861 15.8332 10.0957L18.833 10.1289ZM18.8333 10.0667C18.8333 6.68808 15.8872 4.16675 12.5333 4.16675V7.16675C14.4814 7.16675 15.8333 8.58531 15.8333 10.0667H18.8333ZM12.5333 4.16675C9.68497 4.16675 7.16851 5.9604 6.43924 8.56538L9.32817 9.37414C9.66232 8.18057 10.9061 7.16675 12.5333 7.16675V4.16675ZM7.94494 7.47101C7.87466 7.46814 7.80412 7.4667 7.73333 7.4667V10.4667C7.76328 10.4667 7.793 10.4673 7.82248 10.4685L7.94494 7.47101ZM7.73333 7.4667C4.79987 7.4667 2.5 9.90582 2.5 12.8167H5.5C5.5 11.475 6.54307 10.4667 7.73333 10.4667V7.4667ZM2.5 12.8167C2.5 15.7276 4.79987 18.1667 7.73333 18.1667V15.1667C6.54307 15.1667 5.5 14.1584 5.5 12.8167H2.5ZM7.73784 18.1667L7.76006 18.1666L7.75105 15.1666L7.72883 15.1667L7.73784 18.1667ZM7.75555 18.1666H16.7819V15.1666H7.75555V18.1666ZM16.7996 15.1667C16.7964 15.1667 16.7934 15.1666 16.7904 15.1666L16.7734 18.1666C16.7822 18.1667 16.791 18.1667 16.7996 18.1667V15.1667ZM18.4996 13.3667C18.4996 14.4046 17.6953 15.1667 16.7996 15.1667V18.1667C19.4385 18.1667 21.4996 15.9738 21.4996 13.3667H18.4996ZM17.0773 11.5904C17.8512 11.7243 18.4996 12.4404 18.4996 13.3667H21.4996C21.4996 11.0228 19.8418 9.02419 17.5889 8.63431L17.0773 11.5904Z"
								fill="#008710"
							/>
						</g>
					</svg> */ }

					<h3>VaultPress Backup</h3>
					<p>Save every change and get back online quickly with one‑click restores.</p>
				</div>
				<div>
					{ /* TODO: switch for Scan icon */ }
					<svg
						width="25"
						height="24"
						viewBox="0 0 25 24"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							fill-rule="evenodd"
							clip-rule="evenodd"
							d="M12.5 3.17627L19.25 6.24445V10.8183C19.25 14.7173 16.7458 18.4089 13.2147 19.5735C12.7507 19.7265 12.2493 19.7265 11.7853 19.5735C8.25416 18.4089 5.75 14.7173 5.75 10.8183V6.24445L12.5 3.17627ZM7.25 7.21032V10.8183C7.25 14.1312 9.39514 17.2057 12.2551 18.149C12.414 18.2014 12.586 18.2014 12.7449 18.149C15.6049 17.2057 17.75 14.1312 17.75 10.8183V7.21032L12.5 4.82396L7.25 7.21032Z"
							fill="#008710"
						/>
					</svg>

					<h3>Scan</h3>
					<p>Automated scanning and one‑click fixes to keep your site ahead of security threats.</p>
				</div>
			</div>
		</div>
	);
};
