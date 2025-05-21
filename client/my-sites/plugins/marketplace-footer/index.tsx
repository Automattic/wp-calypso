import { Button } from '@automattic/components';
import { useI18n } from '@wordpress/react-i18n';
import clsx from 'clsx';
import FeatureItem from 'calypso/components/feature-item';
import Section from 'calypso/components/section';
import { preventWidows } from 'calypso/lib/formatting';
import { addQueryArgs } from 'calypso/lib/route';
import { useSelector } from 'calypso/state';
import { isUserLoggedIn, getCurrentUserSiteCount } from 'calypso/state/current-user/selectors';
import { getSectionName } from 'calypso/state/ui/selectors';
import styles from './styles.module.css';

export const MarketplaceFooter = () => {
	const { __ } = useI18n();
	const isLoggedIn = useSelector( isUserLoggedIn );
	const currentUserSiteCount = useSelector( getCurrentUserSiteCount );
	const sectionName = useSelector( getSectionName );
	const classes = clsx( styles[ 'marketplace-footer' ], {
		[ styles[ 'is-logged-in' ] ]: isLoggedIn,
	} );

	const startUrl = addQueryArgs(
		{
			ref: sectionName + '-lp',
		},
		sectionName === 'plugins' ? '/start/business' : '/start'
	);

	return (
		<div className={ classes }>
			<Section
				header={ preventWidows( __( 'You pick the plugin. We’ll take care of the rest.' ) ) }
				className={ styles[ 'marketplace-footer__section' ] }
			>
				{ ( ! isLoggedIn || currentUserSiteCount === 0 ) && (
					<Button
						className={ `is-primary ${ styles[ 'marketplace-footer__cta' ] }` }
						href={ startUrl }
					>
						{ __( 'Get Started' ) }
					</Button>
				) }
				<div className={ styles[ 'marketplace-footer__three-column' ] }>
					<FeatureItem header={ __( 'Fully managed' ) }>
						{ __(
							'Premium plugins are fully managed by the team at WordPress.com. No security patches. No update nags. It just works.'
						) }
					</FeatureItem>
					<FeatureItem header={ __( 'Thousands of plugins' ) }>
						{ __(
							'From WordPress.com premium plugins to thousands more community-authored plugins, we’ve got you covered.'
						) }
					</FeatureItem>
					<FeatureItem header={ __( 'Flexible pricing' ) }>
						{ __(
							'Pay yearly and save. Or keep it flexible with monthly premium plugin pricing. It’s entirely up to you.'
						) }
					</FeatureItem>
				</div>
			</Section>
		</div>
	);
};

export default MarketplaceFooter;
