import clsx from 'clsx';
import { FC } from 'react';
import './style.scss';

interface YahooIconProps {
	isEnabled?: boolean;
}

const YahooIcon: FC< YahooIconProps > = ( { isEnabled = true, ...rest } ) => {
	return (
		<svg
			className={ clsx( 'social-icons social-icons__yahoo', {
				'social-icons--disabled': ! isEnabled,
			} ) }
			width="21"
			height="18"
			viewBox="0 0 21 18"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			{ ...rest }
		>
			<path
				d="M0 4.38194H3.86153L6.11007 10.1344L8.38786 4.38194H12.1473L6.48628 18H2.70242L4.25214 14.3914L0.000119581 4.38194H0ZM16.5252 8.97836H12.3144L16.0517 0L20.2472 0.000179372L16.5252 8.97836ZM13.4174 9.83767C14.7094 9.83767 15.7567 10.885 15.7567 12.1768C15.7567 13.4686 14.7094 14.516 13.4174 14.516C12.1256 14.516 11.0784 13.4686 11.0784 12.1768C11.0784 10.885 12.1257 9.83767 13.4174 9.83767Z"
				fill="#5F01D1"
			/>
		</svg>
	);
};

export default YahooIcon;
