import { useTranslate } from 'i18n-calypso';
import { compact } from 'lodash';
import { FunctionComponent, Fragment, useState, useEffect } from 'react';
import { connect } from 'react-redux';
import earnSectionImage from 'calypso/assets/images/earn/earn-section.svg';
import referralImage from 'calypso/assets/images/earn/referral.svg';
import ClipboardButtonInput from 'calypso/components/clipboard-button-input';
import PromoSection, { Props as PromoSectionProps } from 'calypso/components/promo-section';
import { CtaButton } from 'calypso/components/promo-section/promo-card/cta';
import { localizeUrl } from 'calypso/lib/i18n-utils';
import wp from 'calypso/lib/wp';
import { bumpStat, composeAnalytics, recordTracksEvent } from 'calypso/state/analytics/actions';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import getSiteBySlug from 'calypso/state/sites/selectors/get-site-by-slug';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import type { AppState, SiteSlug } from 'calypso/types';

import './style.scss';

interface ConnectedProps {
	siteId: number | undefined;
	selectedSiteSlug: SiteSlug;
	isJetpack: boolean;
	isAtomicSite: boolean;
	trackCtaButton: ( feature: string ) => void;
}

const ReferAFriendSection: FunctionComponent< ConnectedProps > = ( {
	isJetpack,
	isAtomicSite,
	trackCtaButton,
} ) => {
	const translate = useTranslate();
	const [ peerReferralLink, setPeerReferralLink ] = useState( '' );

	useEffect( () => {
		if ( peerReferralLink ) return;
		wp.req.get( '/me/peer-referral-link', ( error: string, data: string ) => {
			setPeerReferralLink( ! error && data ? data : '' );
		} );
	}, [ peerReferralLink ] );

	const onPeerReferralCtaClick = () => {
		if ( peerReferralLink ) return;
		wp.req.post(
			'/me/peer-referral-link-enable',
			{ enable: true },
			( error: string, data: string ) => {
				setPeerReferralLink( ! error && data ? data : '' );
			}
		);
	};

	const getPeerReferralsCard = () => {
		const isJetpackNotAtomic = isJetpack && ! isAtomicSite;

		if ( isJetpackNotAtomic ) {
			return;
		}

		const cta: CtaButton = {
			text: translate( 'Get shareable link' ) as string,
			action: () => {
				trackCtaButton( 'peer-referral-wpcom' );
				onPeerReferralCtaClick();
			},
		};

		if ( peerReferralLink ) {
			cta.component = <ClipboardButtonInput value={ localizeUrl( peerReferralLink ) } />;
		}

		return {
			title: translate( 'Refer a friend, you’ll both earn credits!' ),
			body: peerReferralLink
				? translate(
						'To earn free credits, share the link below with your friends, family, and website visitors. ' +
							'By doing so you agree to the WordPress.com Peer Referral Program {{a}}Terms and Conditions.{{/a}}',
						{
							components: {
								a: (
									<a
										href="https://wordpress.com/refer-a-friend-program-terms-of-service/"
										target="_blank"
										rel="noopener noreferrer"
									/>
								),
							},
						}
				  )
				: translate(
						'Copy your tracking link and start sharing it with your friends. It’s that easy!'
				  ),
			image: {
				path: referralImage,
			},
			actions: {
				cta,
			},
		};
	};

	const promos: PromoSectionProps = {
		header: {
			title: translate( 'Earn and share rewards when you refer friends.' ),
			image: {
				path: earnSectionImage,
			},
			body: translate(
				'Share WordPress.com with friends, family, and website visitors. For every paying customer you send our way, you’ll both earn US$25 in free credits. {{em}}Available with every plan{{/em}}.',
				{
					components: {
						em: <em />,
					},
				}
			),
		},
		promos: compact( [ getPeerReferralsCard() ] ),
	};

	return (
		<div className="refer-a-friend__earn-page">
			<Fragment>
				<PromoSection { ...promos } />
			</Fragment>
		</div>
	);
};

export default connect(
	( state: AppState ) => {
		const selectedSiteSlug = getSelectedSiteSlug( state );
		const site = getSiteBySlug( state, selectedSiteSlug );
		return {
			siteId: site?.ID,
			isJetpack: Boolean( isJetpackSite( state, site?.ID ?? null ) ),
			isAtomicSite: Boolean( isSiteAutomatedTransfer( state, site?.ID ?? null ) ),
		};
	},
	( dispatch ) => ( {
		trackCtaButton: ( feature: string ) =>
			dispatch(
				composeAnalytics(
					recordTracksEvent( 'calypso_earn_page_cta_button_click', { feature } ),
					bumpStat( 'calypso_earn_page', 'cta-button-' + feature )
				)
			),
	} )
)( ReferAFriendSection );
