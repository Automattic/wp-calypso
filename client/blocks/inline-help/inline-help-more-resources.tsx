import { recordTracksEvent } from '@automattic/calypso-analytics';
import { isWpComBusinessPlan, isWpComEcommercePlan } from '@automattic/calypso-products';
import { useHasSeenWhatsNewModalQuery } from '@automattic/data-stores';
import { localizeUrl } from '@automattic/i18n-utils';
import WhatsNewGuide from '@automattic/whats-new';
import { Button, SVG, Circle } from '@wordpress/components';
import { useState, useEffect } from '@wordpress/element';
import { Icon, captureVideo, desktop, formatListNumbered, video } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import { useSelector } from 'react-redux';
import { getUserPurchases } from 'calypso/state/purchases/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import NewReleases from './icons/new-releases';

const circle = (
	<SVG viewBox="0 0 24 24">
		<Circle cx="12" cy="12" r="5" />
	</SVG>
);

const HelpCenterMoreResources = () => {
	const { __ } = useI18n();
	const [ showWhatsNewDot, setShowWhatsNewDot ] = useState( false );

	const { isBusinessOrEcomPlanUser, siteId } = useSelector( ( state ) => {
		const purchases = getUserPurchases( state );
		const purchaseSlugs = purchases && purchases.map( ( purchase ) => purchase.productSlug );

		return {
			isBusinessOrEcomPlanUser: !! (
				purchaseSlugs &&
				( purchaseSlugs.some( isWpComBusinessPlan ) || purchaseSlugs.some( isWpComEcommercePlan ) )
			),
			siteId: getSelectedSiteId( state ),
		};
	} );
	const { data, isLoading, setHasSeenWhatsNewModal } = useHasSeenWhatsNewModalQuery( siteId );
	useEffect( () => {
		if ( ! isLoading && data ) {
			setShowWhatsNewDot( ! data.has_seen_whats_new_modal );
		}
	}, [ data, isLoading ] );

	const [ showGuide, setShowGuide ] = useState( false );

	const trackCoursesButtonClick = () => {
		recordTracksEvent( 'calypso_help_courses_click', {
			is_business_or_ecommerce_plan_user: isBusinessOrEcomPlanUser,
		} );
	};

	const handleWhatsNewClick = () => {
		if ( ! data?.has_seen_whats_new_modal ) {
			setHasSeenWhatsNewModal( true );
		}
		setShowGuide( true );
	};

	return (
		<>
			<h3 className="inline-help__section-title">{ __( 'More Resources' ) }</h3>
			<ul className="inline-help__more-resources" aria-labelledby="inline-help__more-resources">
				<li className="inline-help__resource-item">
					<div className="inline-help__resource-cell">
						<a
							href={ localizeUrl( 'https://wordpress.com/support/video-tutorials/' ) }
							rel="noreferrer"
							target="_blank"
							className="inline-help__video"
						>
							<Icon icon={ video } size={ 24 } />
							<span>{ __( 'Video tutorials' ) }</span>
						</a>
					</div>
				</li>
				<li className="inline-help__resource-item">
					<div className="inline-help__resource-cell">
						<a
							href={ localizeUrl( 'https://wordpress.com/webinars' ) }
							rel="noreferrer"
							target="_blank"
							onClick={ trackCoursesButtonClick }
							className="inline-help__capture-video"
						>
							<Icon icon={ captureVideo } size={ 24 } />
							<span>{ __( 'Webinars' ) }</span>
						</a>
					</div>
				</li>
				<li className="inline-help__resource-item">
					<div className="inline-help__resource-cell">
						<a
							href={ localizeUrl( 'https://wpcourses.com/?ref=wpcom-help-more-resources' ) }
							rel="noreferrer"
							target="_blank"
							className="inline-help__desktop"
						>
							<Icon icon={ desktop } size={ 24 } />
							<span>{ __( 'Courses' ) }</span>
						</a>
					</div>
				</li>
				<li className="inline-help__resource-item">
					<div className="inline-help__resource-cell">
						<a
							href={ localizeUrl( 'https://learn.wordpress.com' ) }
							rel="noreferrer"
							target="_blank"
							className="inline-help__format-list-numbered"
						>
							<Icon icon={ formatListNumbered } size={ 24 } />
							<span>{ __( 'Step-by-step guides' ) }</span>
						</a>
					</div>
				</li>
				<li className="inline-help__resource-item">
					<div className="inline-help__resource-cell">
						<Button
							isLink
							onClick={ () => handleWhatsNewClick() }
							className="inline-help__new-releases"
						>
							<Icon icon={ <NewReleases /> } size={ 24 } />
							<span>{ __( "What's new" ) }</span>
							{ showWhatsNewDot && <Icon icon={ circle } size={ 16 } /> }
						</Button>
					</div>
				</li>
			</ul>
			{ showGuide && <WhatsNewGuide onClose={ () => setShowGuide( false ) } /> }
		</>
	);
};

export default HelpCenterMoreResources;
