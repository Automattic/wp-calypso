import { recordTracksEvent } from '@automattic/calypso-analytics';
import { isWpComBusinessPlan, isWpComEcommercePlan } from '@automattic/calypso-products';
import { Gridicon } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import { useI18n } from '@wordpress/react-i18n';
import { useSelector } from 'react-redux';
import { getUserPurchases } from 'calypso/state/purchases/selectors';

interface ItemProps {
	link: string;
	icon: string;
	text: string;
	svgColor: string;
	onClickHandler?: () => void;
}

const ResourceItem: React.FC< ItemProps > = ( { link, icon, text, svgColor, onClickHandler } ) => (
	<li className="inline-help__resource-item">
		<div className="inline-help__resource-cell">
			<a href={ localizeUrl( link ) } onClick={ onClickHandler } rel="noreferrer" target="_blank">
				<Gridicon icon={ icon } size={ 24 } fill={ svgColor } />
				<span>{ text }</span>
			</a>
		</div>
	</li>
);

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

	const trackCoursesButtonClick = () => {
		recordTracksEvent( 'calypso_help_courses_click', {
			is_business_or_ecommerce_plan_user: isBusinessOrEcomPlanUser,
		} );
	};

	return (
		<>
			<h3 className="inline-help__section-title">{ __( 'More Resources' ) }</h3>
			<ul className="inline-help__more-resources" aria-labelledby="inline-help__more-resources">
				<ResourceItem
					link={ localizeUrl( 'https://wordpress.com/support/video-tutorials/' ) }
					icon="play"
					text={ __( 'Video tutorials' ) }
					svgColor="#C9356E"
				/>
				<ResourceItem
					link={ localizeUrl( 'https://wordpress.com/webinars' ) }
					icon="video-camera"
					text={ __( 'Webinars' ) }
					onClickHandler={ trackCoursesButtonClick }
					svgColor="#E68B28"
				/>
				<ResourceItem
					link={ 'https://wpcourses.com/?ref=wpcom-help-more-resources' }
					icon="computer"
					text={ __( 'Courses' ) }
					svgColor="#09B585"
				/>
				<ResourceItem
					link={ 'https://learn.wordpress.com' }
					icon="list-ordered"
					text={ __( 'Step-by-step guides' ) }
					svgColor="#B35EB1"
				/>
			</ul>
		</>
	);
};

export default HelpCenterMoreResources;
