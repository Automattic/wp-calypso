import classNames from 'classnames';

import './style.scss';

interface MailIconProps {
	isDisabled: boolean;
}

const MailIcon = ( props: MailIconProps ) => {
	const { isDisabled, ...rest } = props;

	return (
		<svg
			className={ classNames( 'social-icons social-icons__google', {
				'social-icons--enabled': ! isDisabled,
				'social-icons--disabled': !! isDisabled,
			} ) }
			width="18"
			height="14"
			viewBox="0 0 18 14"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			{ ...rest }
		>
			<g>
				<rect
					id="Rectangle 710"
					x="0.75"
					y="0.75"
					width="16.5"
					height="12.5"
					rx="1.25"
					stroke="#1D2327"
					fill="none"
					strokeWidth="1.5"
				/>
				<path
					id="Vector 107"
					d="M1 3.5L9 9.5L17 3.5"
					stroke="#1D2327"
					strokeWidth="1.5"
					fill="none"
				/>
			</g>
		</svg>
	);
};

export default MailIcon;
