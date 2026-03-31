import type { SimpleConsentContent } from './types';

type Props = {
	content: SimpleConsentContent;
	onCustomize: () => void;
	onAcceptAll: () => void;
	onDeclineNonEssential?: () => void;
};

export const SimpleConsent = ( {
	content,
	onCustomize,
	onAcceptAll,
	onDeclineNonEssential,
}: Props ) => (
	<div
		className={
			'cookie-banner__simple-options' +
			( content.declineNonEssentialButton ? ' cookie-banner__simple-options-non-essential' : '' )
		}
	>
		<p className="cookie-banner__simple-text-description">{ content.description }</p>
		<div className="cookie-banner__button-container">
			<button
				className="a8c-cookie-banner__button cookie-banner__customize-button"
				onClick={ onCustomize }
			>
				{ content.customizeButton }
			</button>
			{ content.declineNonEssentialButton && (
				<button
					className="a8c-cookie-banner__button cookie-banner__decline-button"
					onClick={ onDeclineNonEssential }
				>
					{ content.declineNonEssentialButton }
				</button>
			) }
			<button
				className="a8c-cookie-banner__button cookie-banner__accept-all-button"
				onClick={ onAcceptAll }
			>
				{ content.acceptAllButton }
			</button>
		</div>
	</div>
);
