import page from '@automattic/calypso-router';
import { Badge, Button, FoldableCard, Gridicon } from '@automattic/components';
import { Icon, external } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useDispatch, useSelector } from 'react-redux';
import { A4A_MARKETPLACE_HOSTING_PRESSABLE_LINK } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import pressableIcon from 'calypso/assets/images/pressable/pressable-icon.svg';
import { getActiveAgency, isAgencyOwner } from 'calypso/state/a8c-for-agencies/agency/selectors';
import { recordTracksEvent } from 'calypso/state/analytics/actions/record';

const pressableUrl = 'https://my.pressable.com/agency/auth';

const PressableOffering = () => {
	const translate = useTranslate();
	const agency = useSelector( getActiveAgency );
	const dispatch = useDispatch();
	const isPressableRegular =
		null === agency?.third_party?.pressable?.a4a_id && agency?.third_party.pressable.pressable_id;

	const highlights = [
		translate( 'Git integration, WP-CLI, SSH, and staging.' ),
		translate( 'Lightning-fast performance.' ),
		translate( '100% uptime SLA.' ),
		translate( 'Smart, managed plugin updates.' ),
		translate( 'Comprehensive WP security & performance with Jetpack Complete included.' ),
		translate( '24/7 support from WordPress experts.' ),
	];

	const handleActionButtonClick = () => {
		page( A4A_MARKETPLACE_HOSTING_PRESSABLE_LINK );
		dispatch(
			recordTracksEvent( 'calypso_a4a_overview_click_open_marketplace', {
				section: 'hosting',
				product: 'pressable',
			} )
		);
	};

	const header = (
		<div className="a4a-offering-item__title-container">
			<img className="pressable-icon" src={ pressableIcon } alt="Pressable" />
			<div className="a4a-overview-pressable-offering-header-title">
				<h3 className="a4a-offering-item__title">
					{ translate( 'Pressable' ) }
					{ isPressableRegular && (
						<Badge type="success">{ translate( "You're signed up!" ) }</Badge>
					) }
				</h3>
			</div>
		</div>
	);

	const isOwner = useSelector( isAgencyOwner );

	return (
		<FoldableCard
			className="a4a-oferring-item-pressable a4a-offering-item__card"
			header={ header }
			expanded
		>
			<p className="a4a-offering-item__description">
				{ translate(
					'Pressable offers world-class managed WordPress hosting for agencies with award-winning support, powerful site management, and flexible plans that scale with your business.'
				) }
			</p>
			<ul className="a4a-offering-item__card-list">
				{ highlights.map( ( highlightItemText ) => (
					<li className="a4a-offering-item__card-list-item" key={ highlightItemText }>
						<div className="a4a-offering-item__icon-container">
							<Gridicon className="a4a-offering-item__gridicon" icon="checkmark" size={ 18 } />
						</div>
						<span className="a4a-offering-item__text">{ highlightItemText }</span>
					</li>
				) ) }
			</ul>
			{ ! isPressableRegular ? (
				<Button className="a4a-offering-item__button" onClick={ handleActionButtonClick } primary>
					{ translate( 'Explore Pressable' ) }
				</Button>
			) : (
				isOwner && (
					<Button
						className="a4a-offering-item__button"
						primary
						target="_blank"
						rel="norefferer nooppener"
						href={ pressableUrl }
					>
						{ translate( 'View your dashboard' ) }
						<Icon icon={ external } size={ 18 } />
					</Button>
				)
			) }
		</FoldableCard>
	);
};

export default PressableOffering;
