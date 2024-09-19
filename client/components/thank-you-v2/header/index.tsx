import { TranslateResult } from 'i18n-calypso';

import './style.scss';

interface ThankYouHeaderProps {
	title: TranslateResult;
	subtitle: TranslateResult;
	buttons?: React.ReactNode;
}

export default function ThankYouHeader( { title, subtitle, buttons }: ThankYouHeaderProps ) {
	return (
		<div className="thank-you__header">
			<h1 className="thank-you__header-title">{ title }</h1>
			<h2 className="thank-you__header-subtitle">{ subtitle }</h2>
			{ buttons && <div className="thank-you__header-buttons">{ buttons }</div> }
		</div>
	);
}
