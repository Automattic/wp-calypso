interface Props {
	newItems: boolean;
	active: boolean;
}

export const BellIcon: React.FC< Props > = ( { newItems, active } ) => (
	<svg xmlns="http://www.w3.org/2000/svg" width="26" height="25" viewBox="0 0 24 24">
		<g id="without-bubble">
			<path
				fill="var( --color-masterbar-text )"
				d="M9.9,20h4c0,0.5-0.2,1-0.6,1.4   c-0.8,0.8-2,0.8-2.8,0C10.1,21,9.9,20.5,9.9,20z M20,17.5v1H4v-1l0.9-0.7C5.5,16.3,6,15.5,6,15l0-5.5c0-3.3,2.7-6,6-6   c3.3,0,6,2.7,6,6V15c0,0.5,0.5,1.4,1.1,1.8L20,17.5z"
			/>
		</g>
		{ newItems && (
			<g id="with-bubble">
				<path
					fill="var( --color-masterbar-text )"
					d="M18,9.7V15c0,0.5,0.5,1.4,1.1,1.8l0.9,0.7v1H4v-1l0.9-0.7C5.5,16.3,6,15.5,6,15l0-5.5   c0-3.3,2.7-6,6-6c0.7,0,1.4,0.1,2,0.3c0,0.1,0,0.1,0,0.2C14,6.6,15.7,8.8,18,9.7z M13.9,20h-4c0,0.5,0.2,1,0.6,1.4   c0.8,0.8,2,0.8,2.8,0C13.8,21,13.9,20.5,13.9,20z"
				/>
				<path
					id="bubble"
					fill="var( --color-masterbar-unread-dot-background )"
					stroke={
						active
							? 'var( --color-masterbar-item-active-background )'
							: 'var( --color-masterbar-background )'
					}
					strokeWidth="2px"
					d="M20,8c2.2,0,4-1.8,4-4s-1.8-4-4-4s-4,1.8-4,4S17.8,8,20,8z"
				/>
			</g>
		) }
	</svg>
);
