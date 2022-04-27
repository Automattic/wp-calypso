interface Props {
	newItems: boolean;
	active: boolean;
}

export const CartIcon: React.FC< Props > = ( { newItems, active } ) => (
	<svg xmlns="http://www.w3.org/2000/svg" width="26" height="25" viewBox="0 0 24 24">
		<g id="without-bubble">
			<path
				fill="var( --color-masterbar-text )"
				d="M9,20c0,1.1-0.9,2-2,2s-2-0.9-2-2s0.9-2,2-2   S9,18.9,9,20z M17,18c-1.1,0-2,0.9-2,2s0.9,2,2,2s2-0.9,2-2S18.1,18,17,18z M17.4,13c0.9,0,1.7-0.7,2-1.6L21,5H7V4c0-1.1-0.9-2-2-2   H3v2h2v1v8v2c0,1.1,0.9,2,2,2h12c0-1.1-0.9-2-2-2H7v-2H17.4z"
			/>
		</g>
		{ newItems && (
			<g id="with-bubble">
				<path
					fill="var( --color-masterbar-text )"
					d="M14.1,5c0.5,2.7,2.8,4.9,5.6,5l-0.4,1.4   c-0.2,0.9-1,1.6-2,1.6H7v2h10c1.1,0,2,0.9,2,2H7c-1.1,0-2-0.9-2-2v-2V5V4H3V2h2c1.1,0,2,0.9,2,2v1H14.1z M7,22c1.1,0,2-0.9,2-2   s-0.9-2-2-2s-2,0.9-2,2S5.9,22,7,22z M15,20c0-1.1,0.9-2,2-2s2,0.9,2,2s-0.9,2-2,2S15,21.1,15,20z"
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
