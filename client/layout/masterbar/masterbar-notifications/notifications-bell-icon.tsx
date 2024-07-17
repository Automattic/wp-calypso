interface Props {
	newItems: boolean;
	active: boolean;
}

export const BellIcon: React.FC< Props > = ( { newItems, active } ) => (
	<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
		<defs>
			<circle id="bubble" cx="8" cy="4" r="4" />
		</defs>
		<g>
			<path
				fill="var( --color-masterbar-icon )"
				d="M6.14 14.97l2.828 2.827c-.362.362-.862.586-1.414.586-1.105 0-2-.895-2-2 0-.552.224-1.052.586-1.414zm8.867 5.324L14.3 21 3 9.7l.706-.707 1.102.157c.754.108 1.69-.122 2.077-.51l3.885-3.884c2.34-2.34 6.135-2.34 8.475 0s2.34 6.135 0 8.475l-3.885 3.886c-.388.388-.618 1.323-.51 2.077l.157 1.1z"
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
