/* eslint-disable wpcalypso/jsx-classname-namespace */
import { useTranslate } from 'i18n-calypso';
import siteOptionsURL from 'calypso/assets/images/onboarding/site-options.svg';
import FormattedHeader from 'calypso/components/formatted-header';
import type { Step } from '../../types';
import './style.scss';

/**
 * The intent capture step
 */
const SiteOptionsStep: Step = function SiteOptionsStep() {
	const translate = useTranslate();
	const headerText = translate( "First, let's give your blog a name" );

	return (
		<div className="step-horizontal-layout">
			<div className="site-options__header">
				<FormattedHeader id={ 'site-options-header' } headerText={ headerText } align={ 'left' } />
				<div className="step__header-image">
					<img src={ siteOptionsURL } alt="" />
				</div>
			</div>
			<div>{ /*
				options form should be here
				*/ }</div>
		</div>
	);
};

export default SiteOptionsStep;
