import { JetpackLogo } from '@automattic/components/src/logos/jetpack-logo';
import { WordPressLogo } from '@automattic/components/src/logos/wordpress-logo';
import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { __ } from '@wordpress/i18n';
import { reusableBlock } from '@wordpress/icons';
import { addQueryArgs } from '@wordpress/url';
import { useAnalytics } from '../../app/analytics';
import OfferCard from '../../components/offer-card';
import { wpcomLink } from '../../utils/link';
import Column from './column';
import MenuItem from './menu-item';
import type { AddNewSiteProps } from './types';
import './style.scss';

function AddNewSite( { context = 'unknown' }: AddNewSiteProps ) {
	const { recordTracksEvent } = useAnalytics();

	const wordpressClick = () => {
		recordTracksEvent( 'calypso_dashboard_sites_new_site_action_click_add' );
		recordTracksEvent( 'calypso_dashboard_sites_new_site_action_click_item', {
			action: 'wordpress',
		} );
	};
	const jetpackClick = () => {
		recordTracksEvent( 'calypso_dashboard_sites_new_site_action_click_jetpack' );
		recordTracksEvent( 'calypso_dashboard_sites_new_site_action_click_item', {
			action: 'jetpack',
		} );
	};
	const migrateClick = () => {
		recordTracksEvent( 'calypso_dashboard_sites_new_site_action_click_item', {
			action: 'migrate',
		} );
	};
	const offerClick = () => {
		recordTracksEvent( 'calypso_dashboard_sites_new_site_action_click_item', {
			action: 'offer',
		} );
	};

	const isDesktop = useViewportMatch( 'medium' );
	const Wrapper = isDesktop ? HStack : VStack;

	return (
		<Wrapper alignment="flex-start" spacing={ 6 }>
			<Column title={ __( 'Start a new site' ) }>
				<MenuItem
					icon={ <WordPressLogo /> }
					title={ __( 'Build a new site' ) }
					description={ __(
						'Pick a domain and plan, then build it yourself or with the WordPress Agent.'
					) }
					onClick={ wordpressClick }
					href={ addQueryArgs( wpcomLink( '/start' ), {
						source: context,
						ref: 'new-site-popover',
					} ) }
					aria-label={ __( 'Build a new site on WordPress.com' ) }
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

			<OfferCard layout="stacked" onClick={ offerClick } />
		</Wrapper>
	);
}

export default AddNewSite;
