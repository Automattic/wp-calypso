import { BigSkyLogo } from '@automattic/components/src/logos/big-sky-logo';
import { JetpackLogo } from '@automattic/components/src/logos/jetpack-logo';
import { WordPressLogo } from '@automattic/components/src/logos/wordpress-logo';
import { formatNumber } from '@automattic/number-formatters';
import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	__experimentalText as Text,
	Button,
} from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { __, sprintf } from '@wordpress/i18n';
import { reusableBlock } from '@wordpress/icons';
import { addQueryArgs } from '@wordpress/url';
import { useContext } from 'react';
import devSiteBanner from 'calypso/assets/images/a8c-for-agencies/dev-site-banner.svg';
import { useAnalytics } from '../../app/analytics';
import { AuthContext } from '../../app/auth';
import { useHelpCenter } from '../../app/help-center';
import { wpcomLink } from '../../utils/link';
import { userHasFlag } from '../../utils/user';
import Column from './column';
import MenuItem from './menu-item';
import type { AddNewSiteProps } from './types';
import './style.scss';

function AddNewSite( { context = 'unknown' }: AddNewSiteProps ) {
	const { recordTracksEvent } = useAnalytics();
	const auth = useContext( AuthContext );
	const user = auth?.user;
	const isFlexEligible = user ? userHasFlag( user, 'wpcom-flex' ) : false;

	const wordpressClick = () => {
		recordTracksEvent( 'calypso_sites_dashboard_new_site_action_click_add' );
		recordTracksEvent( 'calypso_sites_dashboard_new_site_action_click_item', {
			action: 'wordpress',
		} );
	};
	const jetpackClick = () => {
		recordTracksEvent( 'calypso_sites_dashboard_new_site_action_click_jetpack' );
		recordTracksEvent( 'calypso_sites_dashboard_new_site_action_click_item', {
			action: 'jetpack',
		} );
	};
	const migrateClick = () => {
		recordTracksEvent( 'calypso_sites_dashboard_new_site_action_click_item', {
			action: 'migrate',
		} );
	};
	const offerClick = () => {
		recordTracksEvent( 'calypso_sites_dashboard_new_site_action_click_item', {
			action: 'offer',
		} );
	};

	const isDesktop = useViewportMatch( 'medium' );
	const Wrapper = isDesktop ? HStack : VStack;
	const offer = sprintf(
		// translators: %s is a percentage like 55% off
		__( 'Get a free domain and up to %s off' ),
		formatNumber( 0.55, {
			numberFormatOptions: { style: 'percent' },
		} )
	);

	const { setShowHelpCenter } = useHelpCenter();

	return (
		<Wrapper alignment="flex-start" spacing={ 6 }>
			<Column title={ __( 'Start a new site' ) }>
				{ isFlexEligible && (
					<MenuItem
						icon={ <WordPressLogo /> }
						title={ __( 'Create a Flex site' ) }
						description={ __( 'Provision a flexible WordPress.com environment.' ) }
						onClick={ () => {
							recordTracksEvent( 'calypso_sites_dashboard_new_site_action_click_item', {
								action: 'flex-site',
							} );
						} }
						href={ wpcomLink( `/setup/flex-site?source=${ context }&ref=new-site-popover` ) }
						aria-label={ __( 'Create a Flex site' ) }
					/>
				) }
				<MenuItem
					icon={ <WordPressLogo /> }
					title="Create it yourself"
					description={ __( 'Start with a clean WordPress site and make it yours.' ) }
					onClick={ wordpressClick }
					href={ addQueryArgs( wpcomLink( '/start' ), {
						source: context,
						ref: 'new-site-popover',
					} ) }
					aria-label={ __( 'Create a blank site on WordPress.com' ) }
				/>
				<MenuItem
					icon={ <BigSkyLogo.Mark /> }
					title={ __( 'Create with AI' ) }
					description={ __( 'Describe your idea and let AI help you refine your site.' ) }
					onClick={ () => {
						setShowHelpCenter( false );
						recordTracksEvent( 'calypso_sites_dashboard_new_site_action_click_item', {
							action: 'big-sky',
						} );
					} }
					href={ addQueryArgs( wpcomLink( '/setup/ai-site-builder' ), {
						source: context,
						ref: 'new-site-popover',
					} ) }
					aria-label={ __( 'Build a new site with AI' ) }
				/>
			</Column>
			<Column title={ __( 'Bring an existing site' ) }>
				<MenuItem
					icon={ reusableBlock }
					title={ __( 'Migrate to WordPress.com' ) }
					description={ __( 'Bring your site to the world’s best WordPress host.' ) }
					onClick={ migrateClick }
					href={ wpcomLink( `/setup/site-migration?source=${ context }&ref=new-site-popover` ) }
					aria-label={ __( 'Migrate an existing WordPress site' ) }
				/>
				<MenuItem
					icon={ <JetpackLogo /> }
					title={ __( 'Via the Jetpack plugin' ) }
					description={ __( 'Install the Jetpack plugin on an existing site.' ) }
					onClick={ jetpackClick }
					href={ wpcomLink( `/jetpack/connect?cta_from=${ context }&cta_id=add-site` ) }
					aria-label={ __( 'Add site via the Jetpack plugin' ) }
				/>
			</Column>

			<Button
				href={ wpcomLink( '/setup/onboarding' ) }
				onClick={ offerClick }
				style={ {
					display: 'block',
					height: 'auto',
					textAlign: 'left',
					width: isDesktop ? '260px' : '100%',
					padding: 0,
				} }
				aria-label={ __( 'Get special offer: Free domain and up to 55% off annual plans' ) }
			>
				<VStack className="dashboard-add-new-site__banner">
					<img src={ devSiteBanner } alt="" aria-hidden="true" />
					<Text size="title">{ offer }</Text>
					<Text variant="muted" as="p">
						{ sprintf(
							// translators: %s is a percentage like 55% off
							__(
								'Save up to %s on annual plans and get a free custom domain for a year. Your next site is just a step away.'
							),
							formatNumber( 0.55, {
								numberFormatOptions: { style: 'percent' },
							} )
						) }
					</Text>
					<div aria-hidden="true">{ __( 'Unlock offer' ) }</div>
				</VStack>
			</Button>
		</Wrapper>
	);
}

export default AddNewSite;
