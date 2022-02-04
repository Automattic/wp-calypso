import { Card } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { connect } from 'react-redux';
import DotPager from 'calypso/components/dot-pager';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { DomainOnlyUpsellCarouselProps } from './types';

import './style.scss';

const DomainOnlyUpsellCarousel = ( props: DomainOnlyUpsellCarouselProps ): JSX.Element => {
	const translate = useTranslate();
	const { domain } = props;

	return (
		<DotPager
			className="domain-only-upsell-carousel"
			hasDynamicHeight
			showControlLabels={ false }
			onPageSelected={ () => null }
		>
			<Card>
				{ translate( 'Create a site for %(domain)s', {
					args: { domain: domain.domain },
				} ) }
			</Card>
			<Card>
				{ translate( 'Add email for %(domain)s', {
					args: { domain: domain.domain },
				} ) }
			</Card>
		</DotPager>
	);
};

export default connect( null, { dispatchRecordTracksEvent: recordTracksEvent } )(
	DomainOnlyUpsellCarousel
);
