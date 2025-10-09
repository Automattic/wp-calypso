import React from 'react';

export type MailboxIconProps = React.SVGProps< SVGSVGElement > & {
	size?: number | string;
};

const MailboxIcon: React.FC< MailboxIconProps > = ( { size = 16, ...props } ) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 16 16"
		width={ size }
		height={ size }
		aria-hidden={ props[ 'aria-label' ] ? undefined : true }
		focusable="false"
		{ ...props }
	>
		<path
			fill="#3858e9"
			d="M2 1.5h12a.5.5 0 0 1 .5.5v7H10a2 2 0 0 1-4 0H1.5V2a.5.5 0 0 1 .5-.5m-.5 9V14a.5.5 0 0 0 .5.5h12a.5.5 0 0 0 .5-.5v-3.5h-3.34a3.5 3.5 0 0 1-6.32 0zM0 9V2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2z"
		/>
	</svg>
);

export default MailboxIcon;
