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
	onClickHandler?: () => void;
}

const ResourceItem: React.FC< ItemProps > = ( { link, icon, text, onClickHandler } ) => (
	<li className="inline-help__resource-item">
		<div className="inline-help__resource-cell">
			<a href={ localizeUrl( link ) } onClick={ onClickHandler } rel="noreferrer" target="_blank">
				<Gridicon icon={ icon } size={ 36 } />
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
			<ul aria-labelledby="inline-help__more-resources">
				<ResourceItem
					link={ localizeUrl( 'https://wordpress.com/webinars' ) }
					icon="chat"
					text={ __( 'Webinars' ) }
					onClickHandler={ trackCoursesButtonClick }
				/>
				<ResourceItem
					link={ localizeUrl( 'https://wordpress.com/support/video-tutorials/' ) }
					icon="video"
					text={ __( 'Video tutorials' ) }
				/>
				<ResourceItem
					link={ 'https://wpcourses.com/?ref=wpcom-help-more-resources' }
					icon="mail"
					text={ __( 'Courses' ) }
				/>
				<ResourceItem
					link={ 'https://learn.wordpress.com' }
					icon="list-ordered"
					text={ __( 'Guides' ) }
				/>
			</ul>
		</>
	);
};

export default HelpCenterMoreResources;
