import { Button } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import { Icon, check } from '@wordpress/icons';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useMemo } from 'react';
import Layout from 'calypso/jetpack-cloud/components/layout';
import LayoutBody from 'calypso/jetpack-cloud/components/layout/body';
import PartnerPortalSidebarNavigation from 'calypso/jetpack-cloud/sections/partner-portal/sidebar-navigation';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

import './style.scss';

const A4A_SIGNUP_URL = 'https://automattic.com/for-agencies/';
const JETPACK_PRICING_URL = 'https://jetpack.com/pricing/';
const JETPACK_SUPPORT_URL = 'https://jetpack.com/contact-support/';

export default function ProgramSunset() {
	const translate = useTranslate();
	const dispatch = useDispatch();

	useEffect( () => {
		dispatch( recordTracksEvent( 'calypso_jetpack_manage_program_sunset_visit' ) );
	}, [ dispatch ] );

	const stats = useMemo(
		() => [
			{
				eyebrow: translate( 'Up to' ),
				value: translate( '50%' ),
				label: translate( 'Recurring commissions through referrals' ),
			},
			{
				eyebrow: translate( 'Up to' ),
				value: translate( '77%' ),
				label: translate( 'Off Automattic hosting and products' ),
			},
			{
				eyebrow: translate( 'Over' ),
				value: translate( '$6M' ),
				label: translate( 'Qualified client leads sent to partners' ),
			},
		],
		[ translate ]
	);

	const pillars = useMemo(
		() => [
			{
				key: 'earn',
				title: translate( 'Earn' ),
				items: [
					translate( '50% recurring commission on Jetpack and WooCommerce extension referrals.' ),
					translate( '20% recurring share on WordPress.com and Pressable hosting referrals.' ),
					translate(
						'Earn up to 5 basis points of payment volume on WooPayments stores you refer.'
					),
					translate( 'Save up to 77% on Automattic hosting.' ),
				],
			},
			{
				key: 'build',
				title: translate( 'Build' ),
				items: [
					translate( 'Get Jetpack Complete for free with every site you host on Pressable.' ),
					translate( 'Let clients pay directly with a build-a-cart tool of 60+ products.' ),
					translate(
						'Enjoy a new multi-site management experience for all of your Jetpack sites.'
					),
				],
			},
			{
				key: 'grow',
				title: translate( 'Grow' ),
				items: [
					translate(
						'Get new clients from the WooCommerce, Pressable, WordPress.com, and Jetpack agency directories.'
					),
					translate( 'Receive qualified leads and an assigned partner manager at Pro Partner.' ),
					translate( 'Unlock co-marketing opportunities at higher tiers.' ),
					translate( 'Get priority support, training, and early access to new products.' ),
					translate( 'Get exclusive discounts to agency events.' ),
				],
			},
		],
		[ translate ]
	);

	const onJoinClick = () => {
		dispatch( recordTracksEvent( 'calypso_jetpack_manage_program_sunset_join_a4a_click' ) );
	};

	const onPricingClick = () => {
		dispatch( recordTracksEvent( 'calypso_jetpack_manage_program_sunset_pricing_click' ) );
	};

	const onSupportClick = () => {
		dispatch( recordTracksEvent( 'calypso_jetpack_manage_program_sunset_support_click' ) );
	};

	const options = [
		{
			key: 'join',
			isHighlighted: true,
			title: translate( 'Join Automattic for Agencies for free' ),
			description: translate(
				'Earn recurring commissions, save on hosting, and get priority support. Free to join, with no minimums or exclusivity.'
			),
			action: (
				<Button
					primary
					href={ A4A_SIGNUP_URL }
					target="_blank"
					rel="noopener noreferrer"
					onClick={ onJoinClick }
				>
					{ translate( 'Join Automattic for Agencies' ) }
				</Button>
			),
		},
		{
			key: 'pricing',
			isHighlighted: false,
			title: translate( 'Buy Jetpack products directly' ),
			description: translate(
				'Not an agency? If you manage your own sites, you can still buy new Jetpack products on Jetpack.com.'
			),
			action: (
				<Button
					href={ localizeUrl( JETPACK_PRICING_URL ) }
					target="_blank"
					rel="noopener noreferrer"
					onClick={ onPricingClick }
				>
					{ translate( 'View Jetpack pricing' ) }
				</Button>
			),
		},
		{
			key: 'manage',
			isHighlighted: false,
			title: translate( 'Keep managing your sites' ),
			description: translate(
				'You can keep managing your sites at cloud.jetpack.com exactly as you do today.'
			),
			action: null,
		},
	];

	return (
		<Layout
			className="program-sunset"
			title={ translate( 'Jetpack Manage is now part of Automattic for Agencies' ) }
			wide
			sidebarNavigation={ <PartnerPortalSidebarNavigation /> }
		>
			<LayoutBody>
				<div className="program-sunset-split">
					<section className="program-sunset-hero">
						<p className="program-sunset-eyebrow">
							{ translate( 'Jetpack Manage is now part of Automattic for Agencies' ) }
						</p>
						<h1 className="program-sunset-title">
							{ translate( 'Grow your agency with Automattic for Agencies' ) }
						</h1>
						<p className="program-sunset-intro">
							{ translate(
								'The Jetpack Manage partner program is winding down, so new licenses are no longer available here. Its successor, Automattic for Agencies, offers everything Jetpack Manage did and much more, and it’s free to join.'
							) }
						</p>
						<ul className="program-sunset-stats">
							{ stats.map( ( stat ) => (
								<li key={ stat.label } className="program-sunset-stat">
									<span className="program-sunset-stat-eyebrow">{ stat.eyebrow }</span>
									<span className="program-sunset-stat-value">{ stat.value }</span>
									<span className="program-sunset-stat-label">{ stat.label }</span>
								</li>
							) ) }
						</ul>
					</section>

					<section className="program-sunset-panel">
						<div className="program-sunset-panel-card">
							<h2 className="program-sunset-panel-title">
								{ translate( 'What would you like to do next?' ) }
							</h2>
							<p className="program-sunset-panel-subtitle">
								{ translate( 'Choose the path that fits how you work.' ) }
							</p>
							<ul className="program-sunset-options">
								{ options.map( ( option ) => (
									<li
										key={ option.key }
										className={ clsx( 'program-sunset-option', {
											'is-highlighted': option.isHighlighted,
										} ) }
									>
										<strong className="program-sunset-option-title">{ option.title }</strong>
										<span className="program-sunset-option-description">
											{ option.description }
										</span>
										{ option.action && (
											<div className="program-sunset-option-action">{ option.action }</div>
										) }
									</li>
								) ) }
							</ul>
							<p className="program-sunset-support">
								{ translate( 'Questions? {{a}}Contact Jetpack support{{/a}}', {
									components: {
										a: (
											<a
												href={ localizeUrl( JETPACK_SUPPORT_URL ) }
												target="_blank"
												rel="noopener noreferrer"
												onClick={ onSupportClick }
											/>
										),
									},
								} ) }
							</p>
						</div>
					</section>
				</div>

				<section className="program-sunset-pillars">
					<h2 className="program-sunset-pillars-title">{ translate( 'Grow and unlock more' ) }</h2>
					<p className="program-sunset-pillars-subtitle">
						{ translate(
							'Joining is free. Earn more, build better, and grow your business as you move up partner tiers, from Activated to Premier Partner.'
						) }
					</p>
					<div className="program-sunset-pillars-grid">
						{ pillars.map( ( pillar ) => (
							<div key={ pillar.key } className="program-sunset-pillar">
								<h3 className="program-sunset-pillar-title">{ pillar.title }</h3>
								<ul className="program-sunset-pillar-list">
									{ pillar.items.map( ( item ) => (
										<li key={ item } className="program-sunset-pillar-item">
											<Icon className="program-sunset-pillar-icon" icon={ check } size={ 24 } />
											<span>{ item }</span>
										</li>
									) ) }
								</ul>
							</div>
						) ) }
					</div>
				</section>
			</LayoutBody>
		</Layout>
	);
}
