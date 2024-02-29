import config from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import { Button } from '@automattic/components';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import React, { ReactNode } from 'react';
import InlineSupportLink from 'calypso/components/inline-support-link';
import { useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import getIsSiteWPCOM from 'calypso/state/selectors/is-site-wpcom';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import StatsCardUpsellOverlay from './stats-card-upsell-overlay';

interface Props {
	className: string;
	statType: string;
	siteSlug: string;
	buttonComponent?: ReactNode;
}

// TODO: avoid making UTM call and show a ghost element instead
const StatsCardUpsellJetpack: React.FC< Props > = ( { className, siteSlug } ) => {
	const translate = useTranslate();
	const isOdysseyStats = config.isEnabled( 'is_running_in_jetpack_site' );
	const copyText = translate(
		'Track your campaign performance data with UTM codes. {{learnMoreLink}}Learn more{{/learnMoreLink}}',
		{
			components: {
				learnMoreLink: <InlineSupportLink supportContext="stats" showIcon={ false } />,
			},
		}
	);

	const siteId = useSelector( getSelectedSiteId );
	const isWPCOMSite = useSelector( ( state ) => siteId && getIsSiteWPCOM( state, siteId ) );

	const onClick = () => {
		// We need to ensure we pass the irclick id for impact affiliate tracking if its set.
		const currentParams = new URLSearchParams( window.location.search );
		const queryParams = new URLSearchParams();

		queryParams.set( 'productType', 'commercial' );
		if ( currentParams.has( 'irclickid' ) ) {
			queryParams.set( 'irclickid', currentParams.get( 'irclickid' ) || '' );
		}

		// publish an event
		const event_from = isOdysseyStats ? 'jetpack_odyssey' : 'calypso';
		recordTracksEvent( `${ event_from }_stats_utm_upgrade_clicked` );

		// redirect to the Purchase page
		setTimeout(
			() => page.redirect( `/stats/purchase/${ siteSlug }?${ queryParams.toString() }` ),
			250
		);
	};

	return (
		<StatsCardUpsellOverlay
			className={ className }
			onClick={ onClick }
			copyText={ copyText }
			buttonComponent={
				<Button
					className={ classNames( {
						[ 'jetpack-emerald-button' ]: ! isWPCOMSite,
					} ) }
					onClick={ onClick }
					primary
				>
					{ translate( 'Upgrade plan' ) }
				</Button>
			}
		/>
	);
};

export default StatsCardUpsellJetpack;
