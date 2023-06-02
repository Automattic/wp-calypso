/* eslint-disable no-restricted-imports */
/* eslint-disable wpcalypso/jsx-classname-namespace */
import { recordTracksEvent } from '@automattic/calypso-analytics';
import { isWpComBusinessPlan, isWpComEcommercePlan } from '@automattic/calypso-products';
import { localizeUrl } from '@automattic/i18n-utils';
import WhatsNewGuide from '@automattic/whats-new';
import { Button, SVG, Circle } from '@wordpress/components';
import { useSelect, useDispatch } from '@wordpress/data';
import { useState } from '@wordpress/element';
import { Icon, captureVideo, desktop, formatListNumbered, video, external } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import { useSelector } from 'react-redux';
import { getUserPurchases } from 'calypso/state/purchases/selectors';
import { getSectionName } from 'calypso/state/ui/selectors';
import { NewReleases } from '../icons';
import { HELP_CENTER_STORE } from '../stores';
import type { HelpCenterSelect } from '@automattic/data-stores';

const circle = (
	<SVG viewBox="0 0 24 24">
		<Circle cx="12" cy="12" r="5" />
	</SVG>
);

type CoreDataPlaceholder = {
	hasFinishedResolution: ( ...args: unknown[] ) => boolean;
};

export const HelpCenterMoreResources = () => {
	const { __ } = useI18n();
	const sectionName = useSelector( getSectionName );

	const { isBusinessOrEcomPlanUser } = useSelector( ( state ) => {
		const purchases = getUserPurchases( state );
		const purchaseSlugs = purchases && purchases.map( ( purchase ) => purchase.productSlug );
		return {
			isBusinessOrEcomPlanUser: !! (
				purchaseSlugs &&
				( purchaseSlugs.some( isWpComBusinessPlan ) || purchaseSlugs.some( isWpComEcommercePlan ) )
			),
		};
	} );

	const { hasSeenWhatsNewModal, doneLoading } = useSelect(
		( select ) => ( {
			hasSeenWhatsNewModal: (
				select( HELP_CENTER_STORE ) as HelpCenterSelect
			 ).getHasSeenWhatsNewModal(),
			doneLoading: ( select( 'core/data' ) as CoreDataPlaceholder ).hasFinishedResolution(
				HELP_CENTER_STORE,
				'getHasSeenWhatsNewModal',
				[]
			),
		} ),
		[]
	);

	const { setHasSeenWhatsNewModal } = useDispatch( HELP_CENTER_STORE );

	const showWhatsNewDot = doneLoading && ! hasSeenWhatsNewModal;

	const [ showGuide, setShowGuide ] = useState( false );

	const trackMoreResourcesButtonClick = ( resource: string ) => {
		recordTracksEvent( 'calypso_help_moreresources_click', {
			is_business_or_ecommerce_plan_user: isBusinessOrEcomPlanUser,
			resource: resource,
			force_site_id: true,
			location: 'help-center',
			section: sectionName,
		} );
	};

	const trackWebinairsButtonClick = () => {
		recordTracksEvent( 'calypso_help_courses_click', {
			is_business_or_ecommerce_plan_user: isBusinessOrEcomPlanUser,
			force_site_id: true,
			location: 'help-center',
			section: sectionName,
		} );
		trackMoreResourcesButtonClick( 'webinairs' );
	};

	const handleWhatsNewClick = () => {
		if ( ! hasSeenWhatsNewModal ) {
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
							<span>{ __( 'Video Tutorials', __i18n_text_domain__ ) }</span>
							<Icon icon={ external } size={ 20 } />
						</a>
					</div>
				</li>
				<li className="inline-help__resource-item">
					<div className="inline-help__resource-cell">
						<a
							href={ localizeUrl( 'https://wordpress.com/webinars/' ) }
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
							href="https://wordpress.com/learn/"
							rel="noreferrer"
							target="_blank"
							className="inline-help__desktop"
							onClick={ () => trackMoreResourcesButtonClick( 'starting-guide' ) }
						>
							<Icon icon={ desktop } size={ 24 } />
							<span>{ __( 'Starting Guide', __i18n_text_domain__ ) }</span>
							<Icon icon={ external } size={ 20 } />
						</a>
					</div>
				</li>
				<li className="inline-help__resource-item">
					<div className="inline-help__resource-cell">
						<a
							href={ localizeUrl( 'https://wordpress.com/support' ) }
							rel="noreferrer"
							target="_blank"
							className="inline-help__format-list-numbered"
							onClick={ () => trackMoreResourcesButtonClick( 'support-documentation' ) }
						>
							<Icon icon={ formatListNumbered } size={ 24 } />
							<span>{ __( 'Support Documentation', __i18n_text_domain__ ) }</span>
							<Icon icon={ external } size={ 20 } />
						</a>
					</div>
				</li>
				<li className="inline-help__resource-item">
					<div className="inline-help__resource-cell">
						<Button
							variant="link"
							onClick={ handleWhatsNewClick }
							className="inline-help__new-releases"
						>
							<Icon icon={ <NewReleases /> } size={ 24 } />
							<span>{ __( "What's new", __i18n_text_domain__ ) }</span>
							{ showWhatsNewDot && (
								<Icon className="inline-help__new-releases_dot" icon={ circle } size={ 16 } />
							) }
						</Button>
					</div>
				</li>
			</ul>
			{ showGuide && <WhatsNewGuide onClose={ () => setShowGuide( false ) } /> }
		</>
	);
};
