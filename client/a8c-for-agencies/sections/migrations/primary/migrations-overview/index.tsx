import config from '@automattic/calypso-config';
import { Button, Card, WordPressLogo } from '@automattic/components';
import { Icon, external } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import Layout from 'calypso/a8c-for-agencies/components/layout';
import LayoutBody from 'calypso/a8c-for-agencies/components/layout/body';
import LayoutHeader, {
	LayoutHeaderTitle as Title,
	LayoutHeaderActions as Actions,
} from 'calypso/a8c-for-agencies/components/layout/header';
import LayoutTop from 'calypso/a8c-for-agencies/components/layout/top';
import MobileSidebarNavigation from 'calypso/a8c-for-agencies/components/sidebar/mobile-sidebar-navigation';
import {
	A4A_REFERRALS_BANK_DETAILS_LINK,
	A4A_REFERRALS_PAYMENT_SETTINGS,
} from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import StatusBadge from 'calypso/a8c-for-agencies/components/step-section-item/status-badge';
import useGetTipaltiPayee from 'calypso/a8c-for-agencies/sections/referrals/hooks/use-get-tipalti-payee';
import { getAccountStatus } from 'calypso/a8c-for-agencies/sections/referrals/lib/get-account-status';
import tipaltiLogo from 'calypso/a8c-for-agencies/sections/referrals/lib/tipalti-logo';
import pressableIcon from 'calypso/assets/images/pressable/pressable-icon.svg';
import { preventWidows } from 'calypso/lib/formatting';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

import './style.scss';

export default function MigrationsOverview() {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const title = translate( 'Migrations' );

	const isAutomatedReferralsEnabled = config.isEnabled( 'a4a-automated-referrals' );
	const { data } = useGetTipaltiPayee( true );

	const accountStatus = getAccountStatus( data, translate );
	const statusProps = {
		children: accountStatus?.status,
		type: accountStatus?.statusType,
		tooltip: accountStatus?.statusReason,
	};

	const onAddBankDetailsClick = useCallback( () => {
		dispatch( recordTracksEvent( 'calypso_a4a_migrations_add_bank_details_button_click' ) );
	}, [ dispatch ] );

	const onMigrateToWPCOMClick = useCallback( () => {
		dispatch( recordTracksEvent( 'calypso_a4a_migrations_migrate_to_wpcom_button_click' ) );
	}, [ dispatch ] );

	const onMigrateToPressableClick = useCallback( () => {
		dispatch( recordTracksEvent( 'calypso_a4a_migrations_migrate_to_pressable_button_click' ) );
	}, [ dispatch ] );

	return (
		<Layout className="migrations-overview__layout" title={ title } wide>
			<LayoutTop>
				<LayoutHeader>
					<Title>{ title }</Title>
					<Actions>
						<MobileSidebarNavigation />
					</Actions>
				</LayoutHeader>
			</LayoutTop>

			<LayoutBody>
				<div className="migrations-overview__section-heading">
					{ preventWidows(
						translate(
							'Limited time offer: Migrate your sites to Pressable or WordPress.com and earn up to $10,000!'
						)
					) }
				</div>
				<div className="migrations-overview__section-intro">
					{ translate(
						'From now until the end of 2024, you’ll receive $100 for each site you migrate to Pressable or WordPress.com, up to $10,000.* If you’re a WP\u00A0Engine customer, we’ll also credit the costs to set you free. {{a}}Full Terms ↗{{/a}}',
						{
							components: {
								a: (
									<a
										href="https://automattic.com/for-agencies/program-incentives"
										target="_blank"
										rel="noopener noreferrer"
									/>
								),
							},
						}
					) }
				</div>
				<p className="migrations-overview__asterisk">
					{ translate(
						'* The migration limit is $10,000 for WP\u00A0Engine and $3,000 for other hosts.'
					) }
				</p>
				<div className="migrations-overview__section-subtitle">
					{ translate( 'How do I migrate my clients’ sites?' ) }
				</div>
				<div className="migrations-overview__hosting-cards">
					<Card className="migrations-overview__hosting-card" compact>
						<div>
							<WordPressLogo className="migrations-overview__wpcom-logo" />
						</div>
						<div className="migrations-overview__hosting-card-content">
							<div className="migrations-overview__card-heading">
								{ translate( 'Migrate to WordPress.com' ) }
							</div>
							<div>
								{ translate(
									'Optimized for business websites, local merchants, and small online retailers.'
								) }
							</div>
							<div>
								<Button
									primary
									compact
									onClick={ onMigrateToWPCOMClick }
									href="https://developer.wordpress.com/docs/get-started/build-new-or-migrate/migrate-existing/"
									target="_blank"
								>
									{ translate( 'Migrate to WordPress.com' ) } <Icon icon={ external } size={ 16 } />
								</Button>
							</div>
						</div>
					</Card>
					<Card className="migrations-overview__hosting-card" compact>
						<div>
							<img
								src={ pressableIcon }
								alt="Pressable"
								className="migrations-overview__pressable-logo"
							/>
						</div>
						<div className="migrations-overview__hosting-card-content">
							<div className="migrations-overview__card-heading">
								{ translate( 'Migrate to Pressable' ) }
							</div>
							<div>
								{ translate( 'Best for large-scale businesses and major eCommerce sites.' ) }
							</div>
							<div>
								<Button
									primary
									compact
									onClick={ onMigrateToPressableClick }
									href="https://pressable.com/knowledgebase/migrate-a-site-to-pressable/"
									target="_blank"
								>
									{ translate( 'Migrate to Pressable' ) } <Icon icon={ external } size={ 16 } />
								</Button>
							</div>
						</div>
					</Card>
				</div>
				<div className="migrations-overview__section-subtitle">
					{ translate( 'How do I get paid?' ) }
				</div>
				<Card className="migrations-overview__hosting-card" compact>
					<Icon icon={ tipaltiLogo } className="migrations-overview__tipalti-logo" />
					<div className="migrations-overview__hosting-card-content">
						<div className="migrations-overview__tipalti-card-header">
							<div className="migrations-overview__card-heading">
								{ translate( 'Enter your bank details so we can pay you commissions' ) }
							</div>
							<StatusBadge statusProps={ statusProps } />
						</div>
						<div style={ { maxWidth: '428px' } }>
							{ translate(
								'Get paid seamlessly by adding your bank details and tax forms to Tipalti, our trusted and secure platform for commission payments.'
							) }
						</div>
						<div>
							<Button
								primary
								compact
								href={
									isAutomatedReferralsEnabled
										? A4A_REFERRALS_PAYMENT_SETTINGS
										: A4A_REFERRALS_BANK_DETAILS_LINK
								}
								onClick={ onAddBankDetailsClick }
							>
								{ translate( 'Enter bank details' ) }
							</Button>
						</div>
					</div>
				</Card>
			</LayoutBody>
		</Layout>
	);
}
