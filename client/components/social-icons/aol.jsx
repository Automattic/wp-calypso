import classNames from 'classnames';
import PropTypes from 'prop-types';
import './style.scss';

const AOLIcon = ( { isEnabled, ...rest } ) => {
	return (
		<svg
			className={ classNames( 'social-icons social-icons__aol', {
				'social-icons--disabled': ! isEnabled,
			} ) }
			width="31"
			height="12"
			viewBox="0 0 31 12"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			{ ...rest }
		>
			<path
				d="M4.70589 0L0 11.6863H3.29411L3.84312 10.0392H7.92156L8.47057 11.6863H11.7647L7.13724 0H4.70589ZM22.7451 0V11.6863H25.3333V0H22.7451ZM16.5883 2.58823C13.8824 2.58823 11.8353 4.6902 11.8353 7.29411C11.8353 10.0392 13.9686 12 16.5883 12C19.2078 12 21.3333 10.0392 21.3333 7.29411C21.3333 4.6902 19.2941 2.58823 16.5883 2.58823ZM5.92159 3.68631L7.13724 7.60787H4.70589L5.92159 3.68631ZM16.5883 5.07454C17.7569 5.06671 18.7137 6.06273 18.7137 7.29411C18.7137 8.51763 17.7569 9.51375 16.5883 9.51375C15.4196 9.51375 14.4628 8.51763 14.4628 7.29411C14.4628 6.06273 15.4196 5.07454 16.5883 5.07454ZM28.4807 8.70559C27.5709 8.70559 26.8337 9.44282 26.8337 10.3526C26.8337 11.2624 27.5709 11.9997 28.4807 11.9997C29.3905 11.9997 30.1278 11.2624 30.1278 10.3526C30.1278 9.44282 29.3905 8.70559 28.4807 8.70559Z"
				fill="black"
			/>
		</svg>
	);
};

AOLIcon.propTypes = {
	isEnabled: PropTypes.bool,
};

AOLIcon.defaultProps = {
	isEnabled: true,
};

export default AOLIcon;
