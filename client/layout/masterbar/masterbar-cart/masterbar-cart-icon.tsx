interface Props {
	newItems: boolean;
	active: boolean;
}

export const CartIcon: React.FC< Props > = ( { newItems } ) => (
	<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
		{ newItems ? (
			<g>
				<path
					fill="var( --color-masterbar-icon )"
					d="M9,20c0,1.1-0.9,2-2,2s-2-0.9-2-2s0.9-2,2-2   S9,18.9,9,20z M17,18c-1.1,0-2,0.9-2,2s0.9,2,2,2s2-0.9,2-2S18.1,18,17,18z M17.4,13c0.9,0,1.7-0.7,2-1.6L21,5H7V4c0-1.1-0.9-2-2-2   H3v2h2v1v8v2c0,1.1,0.9,2,2,2h12c0-1.1-0.9-2-2-2H7v-2H17.4z"
				/>
				<circle
					className="cart-circle"
					cx="20"
					cy="4"
					r="4"
					fill="var( --color-masterbar-unread-dot-background )"
				/>
			</g>
		) : (
			<g>
				<path
					fill="var( --color-masterbar-icon )"
					d="M9,20c0,1.1-0.9,2-2,2s-2-0.9-2-2s0.9-2,2-2   S9,18.9,9,20z M17,18c-1.1,0-2,0.9-2,2s0.9,2,2,2s2-0.9,2-2S18.1,18,17,18z M17.4,13c0.9,0,1.7-0.7,2-1.6L21,5H7V4c0-1.1-0.9-2-2-2   H3v2h2v1v8v2c0,1.1,0.9,2,2,2h12c0-1.1-0.9-2-2-2H7v-2H17.4z"
				/>
			</g>
		) }
	</svg>
);
