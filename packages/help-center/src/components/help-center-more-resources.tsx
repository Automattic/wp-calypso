/* eslint-disable no-restricted-imports */
/* eslint-disable wpcalypso/jsx-classname-namespace */
import { recordTracksEvent } from '@automattic/calypso-analytics';
import { isWpComBusinessPlan, isWpComEcommercePlan } from '@automattic/calypso-products';
import { useHasSeenWhatsNewModalQuery } from '@automattic/data-stores';
import { localizeUrl } from '@automattic/i18n-utils';
import WhatsNewGuide from '@automattic/whats-new';
import { Button, SVG, Circle } from '@wordpress/components';
import { useState, useEffect } from '@wordpress/element';
import { Icon, captureVideo, desktop, formatListNumbered, video, external } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import { useSelector } from 'react-redux';
import { getUserPurchases } from 'calypso/state/purchases/selectors';
import { getSite } from 'calypso/state/sites/selectors';
import { getSectionName, getSelectedSiteId } from 'calypso/state/ui/selectors';
import NewReleases from '../icons/new-releases';

const circle = (
	<SVG viewBox="0 0 24 24">
		<Circle cx="12" cy="12" r="5" />
	</SVG>
);

export const HelpCenterMoreResources = () => {
	const { __ } = useI18n();
	const [ showWhatsNewDot, setShowWhatsNewDot ] = useState( false );
	const sectionName = useSelector( getSectionName );

	const { isBusinessOrEcomPlanUser, siteId, isSimpleSite } = useSelector( ( state ) => {
		const purchases = getUserPurchases( state );
		const purchaseSlugs = purchases && purchases.map( ( purchase ) => purchase.productSlug );
		const siteId = getSelectedSiteId( state );
		const site = getSite( state, siteId );

		return {
			isBusinessOrEcomPlanUser: !! (
				purchaseSlugs &&
				( purchaseSlugs.some( isWpComBusinessPlan ) || purchaseSlugs.some( isWpComEcommercePlan ) )
			),
			isSimpleSite: site && ! site.is_wpcom_atomic,
			siteId: siteId,
		};
	} );
	const { data, isLoading, setHasSeenWhatsNewModal } = useHasSeenWhatsNewModalQuery( siteId );
	useEffect( () => {
		if ( ! isLoading && data ) {
			setShowWhatsNewDot( ! data.has_seen_whats_new_modal );
		}
	}, [ data, isLoading ] );

	const [ showGuide, setShowGuide ] = useState( false );

	const trackMoreResourcesButtonClick = ( resource: string ) => {
		recordTracksEvent( 'calypso_help_moreresources_click', {
			is_business_or_ecommerce_plan_user: isBusinessOrEcomPlanUser,
			resource: resource,
			location: 'help-center',
			section: sectionName,
		} );
	};

	const trackWebinairsButtonClick = () => {
		recordTracksEvent( 'calypso_help_courses_click', {
			is_business_or_ecommerce_plan_user: isBusinessOrEcomPlanUser,
			location: 'help-center',
			section: sectionName,
		} );
		trackMoreResourcesButtonClick( 'webinairs' );
	};

	const handleWhatsNewClick = () => {
		if ( ! data?.has_seen_whats_new_modal ) {
			setHasSeenWhatsNewModal( true );
		}
		setShowGuide( true );
		trackMoreResourcesButtonClick( 'whats-new' );
	};

	return (
		<>
			<h3 className="help-center__section-title">
				{ __( 'More Resources', __i18n_text_domain__ ) }
			</h3>
			<ul className="inline-help__more-resources" aria-labelledby="inline-help__more-resources">
				<li className="inline-help__resource-item">
					<div className="inline-help__resource-cell">
						<a
							href={ localizeUrl( 'https://wordpress.com/support/video-tutorials/' ) }
							rel="noreferrer"
							target="_blank"
							className="inline-help__video"
							onClick={ () => trackMoreResourcesButtonClick( 'video' ) }
						>
							<Icon icon={ video } size={ 24 } />
							<span>{ __( 'Video tutorials', __i18n_text_domain__ ) }</span>
							<Icon icon={ external } size={ 20 } />
						</a>
					</div>
				</li>
				<li className="inline-help__resource-item">
					<div className="inline-help__resource-cell">
						<a
							href={ localizeUrl( 'https://wordpress.com/webinars' ) }
							rel="noreferrer"
							target="_blank"
							onClick={ trackWebinairsButtonClick }
							className="inline-help__capture-video"
						>
							<Icon icon={ captureVideo } size={ 24 } />
							<span>{ __( 'Webinars', __i18n_text_domain__ ) }</span>
							<Icon icon={ external } size={ 20 } />
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
							onClick={ () => trackMoreResourcesButtonClick( 'courses' ) }
						>
							<Icon icon={ desktop } size={ 24 } />
							<span>{ __( 'Courses', __i18n_text_domain__ ) }</span>
							<Icon icon={ external } size={ 20 } />
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
							onClick={ () => trackMoreResourcesButtonClick( 'guides' ) }
						>
							<Icon icon={ formatListNumbered } size={ 24 } />
							<span>{ __( 'Step-by-step guides', __i18n_text_domain__ ) }</span>
							<Icon icon={ external } size={ 20 } />
						</a>
					</div>
				</li>
				{ isSimpleSite && (
					<li className="inline-help__resource-item">
						<div className="inline-help__resource-cell">
							<Button
								isLink
								onClick={ () => handleWhatsNewClick() }
								className="inline-help__new-releases"
							>
								<Icon icon={ <NewReleases /> } size={ 24 } />
								<span>{ __( "What's new", __i18n_text_domain__ ) }</span>
								{ showWhatsNewDot && (
									<Icon className="inline-help__new-releases_dot" icon={ circle } size={ 16 } />
								) }
								<Icon icon={ external } size={ 20 } />
							</Button>
						</div>
					</li>
				) }
			</ul>
			{ showGuide && <WhatsNewGuide onClose={ () => setShowGuide( false ) } /> }
		</>
	);
};
