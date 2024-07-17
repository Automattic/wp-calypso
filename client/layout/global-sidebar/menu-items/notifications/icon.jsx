import React from 'react';

export const BellIcon = ( { newItems, strokeWidth = 1.5 } ) => {
	if ( newItems ) {
		return (
			<svg
				className="sidebar__menu-icon sidebar_svg-notifications"
				fill="none"
				height="28"
				viewBox="0 0 28 28"
				width="28"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					clipRule="evenodd"
					d="m19.2759 13.3275v.5949c0 1.4643.1669 2.5948.919 3.3535.3478.3509.8208.6223 1.4603.8103v1.1897h-.3499-1.6501-.1609-2.5625-1.3438-4.5207-2.00004-1.90638-.16088-1.6501-.3499v-1.1897c.63953-.188 1.11251-.4594 1.46033-.8103.75212-.7587.91899-1.8892.91899-3.3535v-2.9741c0-3.33105 2.61725-5.9483 5.94828-5.9483.8356 0 1.6263.16469 2.342.46403-.438.50826-.7704 1.11011-.963 1.77148-.4269-.15273-.8908-.23551-1.379-.23551-2.2265 0-3.94828 1.72182-3.94828 3.9483v2.9741c0 1.0504-.06942 2.2622-.54791 3.3535h8.99239c-.4785-1.0913-.5479-2.303-.5479-3.3535v-1.0343c.608.282 1.2856.4394 2 .4394zm-3.6879 7.7329c.0414.0829.0684.1514.086.2155.0329.1198.0329.2243.0329.3793 0 .2586-.0418.5078-.1189.7414-.0794.2402-.1962.4638-.3434.6638-.4341.5897-1.1328.9741-1.917.9741-.7841 0-1.4828-.3844-1.917-.9741-.1472-.2-.264-.4236-.3433-.6638-.0772-.2336-.119-.4828-.119-.7414 0-.1189.0297-.2082.0595-.2974.009-.027.018-.054.0262-.0819.0188-.0641.0333-.1326.0333-.2155h2z"
					fill="var( --color-masterbar-icon )"
					fillRule="evenodd"
				></path>
				<circle
					cx="19.2759"
					cy="8.56887"
					fill="var( --color-masterbar-unread-dot-background )"
					r="2.97415"
				></circle>
			</svg>
		);
	}
	return (
		<svg
			className="sidebar__menu-icon sidebar_svg-notifications"
			fill="none"
			height="28"
			viewBox="0 0 24 24"
			width="28"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				d="M12 19.25C11.3997 19.25 10.8926 18.8177 10.7755 18.25H13.2245C13.1074 18.8177 12.6003 19.25 12 19.25ZM16.25 9V11.5C16.25 12.4151 16.3207 13.3148 16.6888 14.0672C16.9282 14.5563 17.2751 14.9495 17.7374 15.25H6.2626C6.72492 14.9495 7.07181 14.5563 7.31116 14.0672C7.67934 13.3148 7.75 12.4151 7.75 11.5V9C7.75 6.61421 9.61421 4.75 12 4.75C14.3858 4.75 16.25 6.61421 16.25 9Z"
				stroke="var( --color-masterbar-icon )"
				strokeWidth={ strokeWidth }
			/>
		</svg>
	);
};
export default BellIcon;
