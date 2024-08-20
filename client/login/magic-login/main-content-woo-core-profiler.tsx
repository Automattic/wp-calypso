import { useTranslate } from 'i18n-calypso';
import { FC } from 'react';
import { MagicLoginEmailWrapper } from './magic-login-email/magic-login-email-wrapper';

interface Props {
	emailAddress: string;
}

const MainContentWooCoreProfiler: FC< Props > = ( { emailAddress } ) => {
	const translate = useTranslate();

	return (
		<div className="magic-login__main-content-woo-core-profiler">
			<h1 className="magic-login__form-header">{ translate( 'Check your email' ) }</h1>

			<p className="email-sent">
				{ emailAddress
					? translate( "We've sent a login link to {{strong}}%(emailAddress)s{{/strong}}.", {
							args: {
								emailAddress,
							},
							components: {
								strong: <strong />,
							},
					  } )
					: translate( 'We just emailed you a link.' ) }
			</p>
			<div>
				<svg
					width="76"
					height="76"
					viewBox="0 0 76 76"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<g clipPath="url(#clip0_3589_5342)">
						<path
							d="M43.6092 2.95408C41.7883 1.13859 40.2217 0.340942 38.1592 0.340942C36.0967 0.340942 34.53 1.13859 32.7092 2.95408C31.2133 4.44552 0.65918 35.072 0.65918 35.072L38.1592 58.071L75.6592 35.072C75.6592 35.072 45.105 4.44552 43.6092 2.95408Z"
							fill="#674399"
						/>
						<path d="M68.1592 12.5011H8.15918V64.0285H68.1592V12.5011Z" fill="#BEA0F2" />
						<path d="M56.905 19.9834H19.4092V23.7224H56.905V19.9834Z" fill="#674399" />
						<path d="M56.9092 27.4653H19.4092V31.2043H56.9092V27.4653Z" fill="#674399" />
						<path d="M41.9094 34.9351H19.4136V38.674H41.9094V34.9351Z" fill="#674399" />
						<path
							d="M75.6592 35.0721L38.1592 56.8372L4.39251 35.0721H0.65918V68.129C0.65918 72.7362 3.29251 75.3203 7.93835 75.3203L38.1592 75.3411L68.38 75.3203C73.0258 75.3203 75.6592 72.7362 75.6592 68.129V35.0721Z"
							fill="#674399"
						/>
						<path
							d="M7.93835 75.3245L38.1592 75.3452L65.6175 75.3286L38.1592 56.8414L4.39251 35.0721H0.65918V68.129C0.65918 72.7362 3.29251 75.3245 7.93835 75.3245Z"
							fill="#3C2861"
						/>
					</g>
					<defs>
						<clipPath id="clip0_3589_5342">
							<rect width="75" height="75" fill="white" transform="translate(0.65918 0.340942)" />
						</clipPath>
					</defs>
				</svg>
			</div>
			<div className="magic-login__emails-list">
				<MagicLoginEmailWrapper emailAddress={ emailAddress } />
			</div>
			<p className="email-resend">
				{ translate(
					"Didn't receive the email? You might want to double check your spam folder, or resend the email."
				) }
			</p>
		</div>
	);
};

export default MainContentWooCoreProfiler;
