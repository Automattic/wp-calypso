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
import StatusBadge from 'calypso/a8c-for-agencies/sections/referrals/common/step-section-item/status-badge';
import useGetTipaltiPayee from 'calypso/a8c-for-agencies/sections/referrals/hooks/use-get-tipalti-payee';
import { getAccountStatus } from 'calypso/a8c-for-agencies/sections/referrals/lib/get-account-status';
import tipaltiLogo from 'calypso/a8c-for-agencies/sections/referrals/lib/tipalti-logo';
import pressableIcon from 'calypso/assets/images/pressable/pressable-icon.svg';
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
					{ translate( 'Special limited-time migration offer for our partners' ) }
				</div>
				<div className="migrations-overview__section-intro">
					{ translate(
						"Migrate your clients' sites to WordPress.com or Pressable hosting and earn 50% revenue share until June 30, 2025. You'll also receive an additional $100 for each migrated site—up to $3,000 until July 31, 2024."
					) }
				</div>
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
				<div className="migrations-overview__tos">
					{ translate(
						'To be eligible for the special migration offer, you must migrate a minimum of 3 sites by July 31, 2024, to a WordPress.com or Pressable.com hosting plan. Read the full {{a}}Terms of Service{{/a}}.',
						{
							components: {
								a: (
									<a
										href="https://automattic.com/for-agencies/program-incentives/"
										target="_blank"
										rel="noopener noreferrer"
									/>
								),
							},
						}
					) }
				</div>
			</LayoutBody>
		</Layout>
	);
}
