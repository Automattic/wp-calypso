import { useTranslate, TranslateResult } from 'i18n-calypso';

type OwnProps = {
	showStartingAt?: boolean;
	hideSavingLabel?: boolean;
	belowPriceText?: TranslateResult;
};

const Free: React.FC< OwnProps > = ( { showStartingAt, hideSavingLabel, belowPriceText } ) => {
	const translate = useTranslate();

	return (
			{ showStartingAt && (
				<span className="display-price__above-price-text">{ translate( 'Start for' ) }</span>
			) }
			<span className="display-price__price-free">{ translate( 'Free' ) }</span>
			{ belowPriceText && (
				<span className="display-price__billing-time-frame">{ belowPriceText }</span>
			) }
			{ ! hideSavingLabel && (
			<span className="display-price__get-started">{ translate( 'Get started for free' ) }</span>
			) }
	);
};

export default Free;
