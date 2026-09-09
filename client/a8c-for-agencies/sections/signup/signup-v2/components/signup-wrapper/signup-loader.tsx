import A4ALogo, {
	LOGO_COLOR_SECONDARY_ALT,
	LOGO_COLOR_SECONDARY,
} from 'calypso/a8c-for-agencies/components/a4a-logo';
import { useIsDarkMode } from 'calypso/a8c-for-agencies/hooks/use-is-dark-mode';

const SignupLoader = () => {
	const isDarkMode = useIsDarkMode();

	return (
		<div className="signup-wrapper__loader">
			<A4ALogo
				fullA4AV2
				colors={ { secondary: isDarkMode ? LOGO_COLOR_SECONDARY_ALT : LOGO_COLOR_SECONDARY } }
				className="signup-wrapper__loader-logo"
			/>
		</div>
	);
};

export default SignupLoader;
