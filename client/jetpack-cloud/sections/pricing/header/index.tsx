import { useTranslate } from 'i18n-calypso';
import FormattedHeader from 'calypso/components/formatted-header';
import IntroPricingBanner from 'calypso/components/jetpack/intro-pricing-banner';
import { useExperiment } from 'calypso/lib/explat';
import { preventWidows } from 'calypso/lib/formatting';

import './style.scss';

const Header: React.FC< Props > = () => {
	const translate = useTranslate();
	const [ isLoadingExperimentAssignment, experimentAssignment ] = useExperiment(
		'calypso_jetpack_pricing_page_without_money_back_banner'
	);

	const suppressIntroBanner =
		! isLoadingExperimentAssignment && experimentAssignment?.variationName === 'treatment';

	return (
		<>
			<div className="header">
				<FormattedHeader
					className="header__main-title"
					headerText={ preventWidows(
						translate( 'Security, performance, and marketing tools made for WordPress' )
					) }
					align="center"
				/>
			</div>

			{ ! suppressIntroBanner && <IntroPricingBanner /> }
		</>
	);
};

type Props = {
	urlQueryArgs: { [ key: string ]: string };
};

export default Header;
