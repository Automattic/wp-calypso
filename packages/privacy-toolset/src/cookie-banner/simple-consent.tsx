import type { SimpleConsentContent } from './types';

type Props = {
	content: SimpleConsentContent;
	onCustomize: () => void;
	onAcceptAll: () => void;
};

export const SimpleConsent = ( { content, onCustomize, onAcceptAll }: Props ) => {
	return (
		<div className="cookie-banner__simple-options">
			<p className="cookie-banner__simple-text-description">{ content.description }</p>
			<div className="cookie-banner__button-container">
				<button className="cookie-banner__customize-button" onClick={ onCustomize }>
					{ content.customizeButton }
				</button>
				<button className="cookie-banner__accept-all-button" onClick={ onAcceptAll }>
					{ content.acceptAllButton }
				</button>
			</div>
		</div>
	);
};
