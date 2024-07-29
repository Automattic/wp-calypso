interface Props {
	newItems: boolean;
	active: boolean;
}

export const BellIcon: React.FC< Props > = ( { newItems, active } ) => (
	<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
		<defs>
			<circle id="bubble" cx="20" cy="4" r="4" />
		</defs>
		<g>
			<path
				fill="var( --color-masterbar-icon )"
				d="M9.9,20h4c0,0.5-0.2,1-0.6,1.4   c-0.8,0.8-2,0.8-2.8,0C10.1,21,9.9,20.5,9.9,20z M20,17.5v1H4v-1l0.9-0.7C5.5,16.3,6,15.5,6,15l0-5.5c0-3.3,2.7-6,6-6   c3.3,0,6,2.7,6,6V15c0,0.5,0.5,1.4,1.1,1.8L20,17.5z"
			/>
			{ newItems && (
				<g className="notifications-bell-icon__bubble">
					<use
						// eslint-disable-next-line wpcalypso/jsx-classname-namespace
						className="border"
						xlinkHref="#bubble"
						transform="scale( 1.5 )"
						fill={
							active
								? 'var( --color-masterbar-item-active-background )'
								: 'var( --color-masterbar-background )'
						}
					/>
					<use xlinkHref="#bubble" fill="var( --color-masterbar-unread-dot-background )" />
				</g>
			) }
		</g>
	</svg>
);
