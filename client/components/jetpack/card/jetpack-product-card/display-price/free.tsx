import { useTranslate, TranslateResult } from 'i18n-calypso';

type OwnProps = {
	belowPriceText?: TranslateResult;
};

const Free: React.FC< OwnProps > = ( { belowPriceText } ) => {
	const translate = useTranslate();

	return (
		<div>
			<span className="display-price__price-free">{ translate( 'Free' ) }</span>
			{ belowPriceText && (
				<span className="display-price__billing-time-frame">{ belowPriceText }</span>
			) }
			<span className="display-price__get-started">{ translate( 'Get started for free' ) }</span>
		</div>
	);
};

export default Free;
