import clsx from 'clsx';
import { FC } from 'react';
import './style.scss';

interface GmailIconProps {
	isEnabled?: boolean;
}

const GmailIcon: FC< GmailIconProps > = ( { isEnabled = true, ...rest } ) => {
	return (
		<svg
			className={ clsx( 'social-icons social-icons__gmail', {
				'social-icons--disabled': ! isEnabled,
			} ) }
			width="20"
			height="14"
			viewBox="0 0 20 14"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			{ ...rest }
		>
			<g clipPath="url(#clip0_406_1985)">
				<path
					d="M1.77273 13.9999H4.74242V6.78778L0.5 3.60596V12.7272C0.5 13.4314 1.07061 13.9999 1.77273 13.9999Z"
					fill="#4285F4"
				/>
				<path
					d="M14.9243 13.9999H17.894C18.5983 13.9999 19.1667 13.4293 19.1667 12.7272V3.60596L14.9243 6.78778"
					fill="#34A853"
				/>
				<path
					d="M14.9243 1.27268V6.78783L19.1667 3.60601V1.90904C19.1667 0.3351 17.3701 -0.562173 16.1122 0.381766"
					fill="#FBBC04"
				/>
				<path
					d="M4.74219 6.78786V1.27271L9.8331 5.09089L14.924 1.27271V6.78786L9.8331 10.606"
					fill="#EA4335"
				/>
				<path
					d="M0.5 1.90904V3.60601L4.74242 6.78783V1.27268L3.55455 0.381766C2.29455 -0.562173 0.5 0.3351 0.5 1.90904Z"
					fill="#C5221F"
				/>
			</g>
			<defs>
				<clipPath id="clip0_406_1985">
					<rect width="18.6667" height="14" fill="white" transform="translate(0.5)" />
				</clipPath>
			</defs>
		</svg>
	);
};

export default GmailIcon;
