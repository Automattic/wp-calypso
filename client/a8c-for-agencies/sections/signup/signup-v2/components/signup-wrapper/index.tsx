import A4ALogo, {
	LOGO_COLOR_SECONDARY_ALT,
	LOGO_COLOR_SECONDARY,
} from 'calypso/a8c-for-agencies/components/a4a-logo';
import { useIsDarkMode } from 'calypso/a8c-for-agencies/hooks/use-is-dark-mode';
import SignupTestimonial from './testimonial';

import './style.scss';

type Props = {
	children?: React.ReactNode;
};

const SignupWrapper = ( { children }: Props ) => {
	const isDarkMode = useIsDarkMode();

	return (
		<div className="signup-wrapper">
			<div className="signup-wrapper__left">
				<A4ALogo
					fullA4AV2
					colors={ { secondary: isDarkMode ? LOGO_COLOR_SECONDARY_ALT : LOGO_COLOR_SECONDARY } }
					className="signup-wrapper__logo"
				/>
				<SignupTestimonial />
			</div>
			<div className="signup-wrapper__right">{ children }</div>
		</div>
	);
};

export default SignupWrapper;
