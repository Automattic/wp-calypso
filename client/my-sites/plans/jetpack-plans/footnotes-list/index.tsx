import { useTranslate } from 'i18n-calypso';

import './style.scss';

export const FootnotesList = () => {
	const translate = useTranslate();

	return (
		<ul className="footnotes-list">
			<li className="footnotes-list__item">
				{ translate( '* Monthly plans are 7-day money back guarantee.' ) }
			</li>
			<li className="footnotes-list__item">
				{ translate( '✢ Discount is for first term only, all renewals are at full price.' ) }
			</li>
		</ul>
	);
};
