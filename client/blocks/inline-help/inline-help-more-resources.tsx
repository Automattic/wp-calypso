import { recordTracksEvent } from '@automattic/calypso-analytics';
import { isWpComBusinessPlan, isWpComEcommercePlan } from '@automattic/calypso-products';
import { localizeUrl } from '@automattic/i18n-utils';
import WhatsNewGuide from '@automattic/whats-new';
import { Button } from '@wordpress/components';
import { useState } from '@wordpress/element';
import { Icon, captureVideo, desktop, formatListNumbered, video } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import { useSelector } from 'react-redux';
import MaterialIcon from 'calypso/components/material-icon';
import { getUserPurchases } from 'calypso/state/purchases/selectors';

const HelpCenterMoreResources = () => {
	const { __ } = useI18n();
	const isBusinessOrEcomPlanUser = useSelector( ( state ) => {
		const purchases = getUserPurchases( state );
		const purchaseSlugs = purchases && purchases.map( ( purchase ) => purchase.productSlug );

		return !! (
			purchaseSlugs &&
			( purchaseSlugs.some( isWpComBusinessPlan ) || purchaseSlugs.some( isWpComEcommercePlan ) )
		);
	} );
	const [ showGuide, setShowGuide ] = useState( false );

	const trackCoursesButtonClick = () => {
		recordTracksEvent( 'calypso_help_courses_click', {
			is_business_or_ecommerce_plan_user: isBusinessOrEcomPlanUser,
		} );
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
						>
							<Icon icon={ video } size={ 24 } fill="#C9356E" />
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
						>
							<Icon icon={ captureVideo } size={ 24 } fill="#E68B28" />
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
						>
							<Icon icon={ desktop } size={ 24 } fill="#09B585" />
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
						>
							<Icon icon={ formatListNumbered } size={ 24 } fill="#B35EB1" />
							<span>{ __( 'Step-by-step guides' ) }</span>
						</a>
					</div>
				</li>
				<li className="inline-help__resource-item">
					<div className="inline-help__resource-cell">
						<Button isLink onClick={ () => setShowGuide( true ) }>
							<MaterialIcon icon="new_releases" size={ 24 } fill="#003C56" />
							<span>{ __( "What's new" ) }</span>
						</Button>
					</div>
				</li>
			</ul>
			{ showGuide && <WhatsNewGuide onClose={ () => setShowGuide( false ) } /> }
		</>
	);
};

export default HelpCenterMoreResources;
