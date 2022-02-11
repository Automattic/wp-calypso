import { Card, Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { connect } from 'react-redux';
import placeholderImage from 'calypso/assets/images/domains/domain.svg';
import DotPager from 'calypso/components/dot-pager';
import TrackComponentView from 'calypso/lib/analytics/track-component-view';
import { hasPaidEmailWithUs } from 'calypso/lib/emails';
import { emailManagementPurchaseNewEmailAccount } from 'calypso/my-sites/email/paths';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { createSiteFromDomainOnly } from '../../paths';
import { DomainOnlyUpsellCarouselProps } from './types';

import './style.scss';

const DomainOnlyUpsellCarousel = ( props: DomainOnlyUpsellCarouselProps ): JSX.Element => {
	const translate = useTranslate();
	const { domain, dispatchRecordTracksEvent } = props;

	const illustration = <img src={ placeholderImage } alt="" width={ 140 } />;

	const getActionClickHandler = ( buttonURL: string, sourceCardType: string ) => () => {
		dispatchRecordTracksEvent( 'calypso_domain_only_upsell_card_click', {
			button_url: buttonURL,
			source_card_type: sourceCardType,
		} );
	};

	const renderAddSiteCard = () => {
		const actionUrl = createSiteFromDomainOnly( domain.domain, domain.blogId );
		return (
			<Card className="domain-only-upsell-carousel__card" key="domain-only-upsell-site">
				<div className="domain-only-upsell-carousel__card-wrapper is-compact">
					<div className="domain-only-upsell-carousel__card-illustration">{ illustration }</div>
					<div className="domain-only-upsell-carousel__card-content">
						<div className="domain-only-upsell-carousel__card-text">
							<h2>
								{ translate( 'Create a site for %(domain)s', {
									args: { domain: domain.domain },
								} ) }
							</h2>
							<h3> { translate( 'Choose a theme, customize and launch your site.' ) } </h3>
						</div>
						<div className="domain-only-upsell-carousel__card-actions">
							<Button
								primary
								href={ actionUrl }
								onClick={ getActionClickHandler( actionUrl, 'create-site' ) }
							>
								{ translate( 'Create site' ) }
							</Button>
						</div>
					</div>
				</div>
				<TrackComponentView
					eventName="calypso_domain_only_upsell_carousel_impression"
					eventProperties={ { content_type: 'create-site' } }
				/>
			</Card>
		);
	};

	const renderEmailCard = () => {
		const actionUrl = emailManagementPurchaseNewEmailAccount( domain.domain, domain.domain );
		return (
			<Card className="domain-only-upsell-carousel__card" key="domain-only-upsell-email">
				<div className="domain-only-upsell-carousel__card-wrapper is-compact">
					<div className="domain-only-upsell-carousel__card-illustration">{ illustration }</div>
					<div className="domain-only-upsell-carousel__card-content">
						<div className="domain-only-upsell-carousel__card-text">
							<h2>
								{ translate( 'Add email for %(domain)s', {
									args: { domain: domain.domain },
								} ) }
							</h2>
							<h3>
								{ translate( 'Send and receive emails from %(email)s', {
									args: { email: `youremail@${ domain.domain }` },
								} ) }
							</h3>
						</div>
						<div className="domain-only-upsell-carousel__card-actions">
							<Button
								primary
								href={ actionUrl }
								onClick={ getActionClickHandler( actionUrl, 'add-professional-email' ) }
							>
								{ translate( 'Add professional email' ) }
							</Button>
						</div>
					</div>
				</div>
				<TrackComponentView
					eventName="calypso_domain_only_upsell_carousel_impression"
					eventProperties={ { content_type: 'add-professional-email' } }
				/>
			</Card>
		);
	};

	const cards = [ renderAddSiteCard() ];
	if ( ! hasPaidEmailWithUs( domain ) ) {
		cards.push( renderEmailCard() );
	}

	return (
		<DotPager className="domain-only-upsell-carousel" hasDynamicHeight showControlLabels={ false }>
			{ cards }
		</DotPager>
	);
};

export default connect( null, { dispatchRecordTracksEvent: recordTracksEvent } )(
	DomainOnlyUpsellCarousel
);
