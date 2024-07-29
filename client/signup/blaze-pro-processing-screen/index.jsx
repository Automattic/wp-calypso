import { useTranslate } from 'i18n-calypso';
import './style.scss';

export default function BlazeProSignupProcessingScreen() {
	const translate = useTranslate();

	return (
		<div className="blaze-pro-processing-screen">
			<div className="blaze-pro-processing-screen__container">
				<div className="blaze-pro-processing-screen__spinner"></div>

				<div className="blaze-pro-processing-screen__title">
					{ translate( 'Setting up your account' ) }
				</div>

				<div className="blaze-pro-processing-screen__subtitle">
					{ translate(
						"Hang tight, we're almost there! You'll be redirected to Blaze Pro shortly"
					) }
				</div>
			</div>
		</div>
	);
}
