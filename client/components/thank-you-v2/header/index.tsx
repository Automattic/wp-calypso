import { TranslateResult } from 'i18n-calypso';

import './style.scss';

interface ThankYouHeaderProps {
	title: string | TranslateResult;
	subtitle: string | TranslateResult;
	buttons?: React.ReactNode;
}

const ThankYouHeader: React.FC< ThankYouHeaderProps > = ( { title, subtitle, buttons } ) => {
	return (
		<div className="thank-you__header">
			<h1 className="thank-you__header-title">{ title }</h1>
			<h2 className="thank-you__header-subtitle">{ subtitle }</h2>
			{ buttons && <div className="thank-you__header-buttons">{ buttons }</div> }
		</div>
	);
};

export default ThankYouHeader;
