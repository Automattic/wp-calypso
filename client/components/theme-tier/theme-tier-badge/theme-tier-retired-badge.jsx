import { PremiumBadge } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import InlineSupportLink from 'calypso/components/inline-support-link';

export default function ThemeTierRetiredBadge() {
	const translate = useTranslate();

	const tooltipContent = (
		<div data-testid="upsell-message">
			{ translate(
				'This theme has been retired and will only receive security updates. {{learnMoreLink}}Learn more{{/learnMoreLink}}',
				{
					components: {
						learnMoreLink: <InlineSupportLink supportContext="themes-retired" />,
					},
				}
			) }
		</div>
	);

	return (
		<PremiumBadge
			className="theme-tier-badge__content is-third-party"
			focusOnShow={ false }
			isClickable={ false }
			labelText={ translate( 'Retired' ) }
			shouldHideIcon
			tooltipClassName="theme-tier-badge-tooltip"
			tooltipContent={ tooltipContent }
			tooltipPosition="top"
		/>
	);
}
