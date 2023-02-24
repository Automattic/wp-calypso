export default function BellOffIcon() {
	return (
		<span className="blogging-prompt__bell-icon">
			<svg
				className="gridicon"
				xmlns="http://www.w3.org/2000/svg"
				viewBox="4 0 24 24"
				height="24px"
				width="24px"
			>
				<g>
					<mask
						id="mask0_766_4208"
						style={ { maskType: 'alpha' } }
						maskUnits="userSpaceOnUse"
						x="7"
						y="5"
						width="14"
						height="17"
					>
						<path
							fillRule="evenodd"
							clipRule="evenodd"
							d="M20.8003 18.0896L20.8003 17.2575L20.0591 16.7013C19.5511 16.3206 19.1357 15.6341 19.1357 15.1769L19.1357 10.5984C19.1357 7.84064 16.8995 5.60442 14.1418 5.60442C11.384 5.60442 9.14782 7.84064 9.14782 10.5984L9.14723 15.1763C9.14723 15.6335 8.7318 16.32 8.22386 16.7007L7.48199 17.2575L7.48199 18.0896L20.8003 18.0896ZM15.2826 20.5232C15.6078 20.1979 15.7705 19.7713 15.7705 19.3447L12.4376 19.3447C12.4376 19.7713 12.6009 20.1973 12.9255 20.5232C13.5767 21.1743 14.6314 21.1743 15.2826 20.5232Z"
							fill="white"
						/>
					</mask>
					<g mask="url(#mask0_766_4208)">
						<rect y="14.1422" width="20" height="20" transform="rotate(-45 0 14.1422)" />
					</g>
					<path
						className="bell"
						d="M21.1406 6.14215L7.14062 20.1422"
						stroke="var(--color-neutral-50)"
						strokeWidth="1.5"
					/>
					<path
						className="strike-through"
						d="M20.1406 5.14215L5.14062 20.1421"
						stroke="white"
						strokeWidth="1.5"
					/>
				</g>
			</svg>
		</span>
	);
}
