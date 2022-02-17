import { Card, Button, Gridicon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import moment from 'moment';
import { useEffect, useState, useRef, ReactChild } from 'react';
import { connect, DefaultRootState } from 'react-redux';
import addEmailImage from 'calypso/assets/images/domains/add-email.svg';
import createSiteImage from 'calypso/assets/images/domains/create-site.svg';
import DotPager from 'calypso/components/dot-pager';
import PopoverMenu from 'calypso/components/popover-menu';
import PopoverMenuItem from 'calypso/components/popover-menu/item';
import TrackComponentView from 'calypso/lib/analytics/track-component-view';
import { hasPaidEmailWithUs } from 'calypso/lib/emails';
import { emailManagementPurchaseNewEmailAccount } from 'calypso/my-sites/email/paths';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { requestDomainsNotices, updateDomainNotice } from 'calypso/state/domains/notices/actions';
import {
	getDomainNotice,
	isRequestingDomainNotices,
	isUpdatingDomainNotices,
} from 'calypso/state/domains/notices/selectors';
import { createSiteFromDomainOnly } from '../../paths';
import {
	DomainOnlyUpsellCarouselConnectedProps,
	DomainOnlyUpsellCarouselOwnProps,
	DomainOnlyUpsellCarouselProps,
	HideCardDuration,
	UpsellCardNoticeType,
} from './types';

import './style.scss';

const DomainOnlyUpsellCarousel = ( props: DomainOnlyUpsellCarouselProps ): JSX.Element | null => {
	const translate = useTranslate();
	const [ areHideSiteCardOptionsVisible, setHideSiteCardOptionsVisible ] = useState( false );
	const [ areHideEmailCardOptionsVisible, setHideEmailCardOptionsVisible ] = useState( false );
	const hideCreateSiteCardButtonRef = useRef( null );
	const hideAddEmailCardButtonRef = useRef( null );

	const {
		domain,
		isRequestingDomainNotices,
		isUpdatingDomainNotices,
		hideCreateSiteCard,
		hideAddEmailCard,
		dispatchRecordTracksEvent,
		requestDomainsNotices,
	} = props;

	useEffect( () => {
		requestDomainsNotices( domain.domain );
	}, [ requestDomainsNotices, domain.domain ] );

	const getActionClickHandler = ( buttonURL: string, sourceCardType: string ) => () => {
		dispatchRecordTracksEvent( 'calypso_domain_only_upsell_card_click', {
			button_url: buttonURL,
			source_card_type: sourceCardType,
		} );
	};

	const hideCard = (
		reminder: HideCardDuration,
		noticeType: UpsellCardNoticeType,
		sourceCardType: string
	) => {
		setHideSiteCardOptionsVisible( false );
		setHideEmailCardOptionsVisible( false );
		const mapReminderToMomentArgs = {
			[ HideCardDuration.ONE_WEEK ]: { weeks: 1 },
			[ HideCardDuration.ONE_MONTH ]: { months: 1 },
		};
		const noticeValue = moment().add( mapReminderToMomentArgs[ reminder ] ).toISOString();
		dispatchRecordTracksEvent( 'calypso_domain_only_upsell_card_hide_card', {
			source_card_type: sourceCardType,
			reminder,
		} );
		props.updateDomainNotice( domain.domain, noticeType, noticeValue );
	};

	const renderCard = ( {
		actionUrl,
		imageUrl,
		title,
		subtitle,
		ref,
		buttonLabel,
		cardName,
		cardNoticeType,
		eventTrackViewName,
		areHideOptionsVisible,
		setHideOptionsVisible,
	}: {
		actionUrl: string;
		imageUrl: string;
		title: ReactChild;
		subtitle: ReactChild;
		ref: React.MutableRefObject< null >;
		buttonLabel: ReactChild;
		cardName: string;
		cardNoticeType: UpsellCardNoticeType;
		eventTrackViewName: string;
		areHideOptionsVisible: boolean;
		setHideOptionsVisible: ( arg: boolean ) => void;
	} ): JSX.Element => {
		return (
			<Card className="domain-only-upsell-carousel__card" key="domain-only-upsell-site">
				<div className="domain-only-upsell-carousel__card-wrapper is-compact">
					<div className="domain-only-upsell-carousel__card-illustration">
						<img src={ imageUrl } alt="" width={ 170 } />
					</div>
					<div className="domain-only-upsell-carousel__card-content">
						<div className="domain-only-upsell-carousel__card-text">
							<h2>{ title }</h2>
							<h3> { subtitle } </h3>
						</div>
						<div className="domain-only-upsell-carousel__card-actions">
							<Button
								primary
								href={ actionUrl }
								onClick={ getActionClickHandler( actionUrl, cardName ) }
							>
								{ buttonLabel }
							</Button>
							<Button
								borderless
								disabled={ isUpdatingDomainNotices }
								ref={ ref }
								onClick={ () => setHideOptionsVisible( true ) }
								aria-haspopup
								aria-expanded={ areHideOptionsVisible }
								aria-controls={ `popover-menu-hide-${ cardName }` }
							>
								{ translate( 'Hide this' ) } <Gridicon icon="chevron-down" size={ 12 } />
							</Button>
							{ areHideOptionsVisible && (
								<PopoverMenu
									id={ `popover-menu-hide-${ cardName }` }
									context={ ref.current }
									isVisible={ areHideOptionsVisible }
									onClose={ () => setHideOptionsVisible( false ) }
									position="bottom"
								>
									<PopoverMenuItem
										onClick={ () =>
											hideCard( HideCardDuration.ONE_WEEK, cardNoticeType, cardName )
										}
									>
										{ translate( 'For a week' ) }
									</PopoverMenuItem>
									<PopoverMenuItem
										onClick={ () =>
											hideCard( HideCardDuration.ONE_MONTH, cardNoticeType, cardName )
										}
									>
										{ translate( 'For a month' ) }
									</PopoverMenuItem>
								</PopoverMenu>
							) }
						</div>
					</div>
				</div>
				<TrackComponentView
					eventName={ eventTrackViewName }
					eventProperties={ { content_type: cardName } }
				/>
			</Card>
		);
	};

	if ( isRequestingDomainNotices ) return null;

	const cards = [];

	if ( ! hideCreateSiteCard ) {
		cards.push(
			renderCard( {
				actionUrl: createSiteFromDomainOnly( domain.domain, domain.blogId ),
				imageUrl: createSiteImage,
				title: translate( 'Create a site for %(domain)s', {
					args: { domain: domain.domain },
				} ),
				subtitle: translate( 'Choose a theme, customize and launch your site.' ),
				ref: hideCreateSiteCardButtonRef,
				buttonLabel: translate( 'Create site' ),
				cardName: 'create-site',
				cardNoticeType: 'upsellCarouselHideCreateSiteCardUntil',
				eventTrackViewName: 'calypso_domain_only_upsell_carousel_impression_create_site_card',
				areHideOptionsVisible: areHideSiteCardOptionsVisible,
				setHideOptionsVisible: setHideSiteCardOptionsVisible,
			} )
		);
	}

	if ( ! hasPaidEmailWithUs( domain ) && ! hideAddEmailCard ) {
		cards.push(
			renderCard( {
				actionUrl: emailManagementPurchaseNewEmailAccount( domain.domain, domain.domain ),
				imageUrl: addEmailImage,
				title: translate( 'Add email for %(domain)s', {
					args: { domain: domain.domain },
				} ),
				subtitle: translate( 'Send and receive emails from %(email)s', {
					args: { email: `youremail@${ domain.domain }` },
				} ),
				ref: hideAddEmailCardButtonRef,
				buttonLabel: translate( 'Add professional email' ),
				cardName: 'add-email',
				cardNoticeType: 'upsellCarouselHideAddEmailCardUntil',
				eventTrackViewName: 'calypso_domain_only_upsell_carousel_impression_add_email_card',
				areHideOptionsVisible: areHideEmailCardOptionsVisible,
				setHideOptionsVisible: setHideEmailCardOptionsVisible,
			} )
		);
	}

	if ( cards.length === 0 ) return null;

	return (
		<DotPager
			className="domain-only-upsell-carousel"
			hasDynamicHeight={ false }
			showControlLabels={ false }
		>
			{ cards }
		</DotPager>
	);
};

const shouldHideCard = ( date: string | null ): boolean => {
	if ( ! date ) return false;
	const reminderEnd = moment( date );
	return reminderEnd.isValid() && moment().isBefore( reminderEnd );
};

export default connect<
	DefaultRootState,
	DomainOnlyUpsellCarouselConnectedProps,
	DomainOnlyUpsellCarouselOwnProps
>(
	( state, ownProps ) => {
		const domainName = ownProps.domain.domain;
		return {
			hideAddEmailCard: shouldHideCard(
				getDomainNotice( state, domainName, 'upsellCarouselHideAddEmailCardUntil' )
			),
			hideCreateSiteCard: shouldHideCard(
				getDomainNotice( state, domainName, 'upsellCarouselHideCreateSiteCardUntil' )
			),
			isRequestingDomainNotices: isRequestingDomainNotices( state, domainName ),
			isUpdatingDomainNotices: isUpdatingDomainNotices( state, domainName ),
		};
	},
	{
		dispatchRecordTracksEvent: recordTracksEvent,
		requestDomainsNotices,
		updateDomainNotice,
	}
)( DomainOnlyUpsellCarousel );
