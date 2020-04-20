/**
 * External dependencies
 */
import { connect } from 'react-redux';
import React, { FunctionComponent, Fragment, useState, useEffect } from 'react';
import { compact } from 'lodash';

/**
 * Internal dependencies
 */
import wp from 'lib/wp';
import { SiteSlug } from 'types';
import { useTranslate } from 'i18n-calypso';
import { isJetpackSite } from 'state/sites/selectors';
import { getSelectedSiteSlug } from 'state/ui/selectors';
import getSiteBySlug from 'state/sites/selectors/get-site-by-slug';
import isSiteAutomatedTransfer from 'state/selectors/is-site-automated-transfer';
import PromoSection, { Props as PromoSectionProps } from 'components/promo-section';
import { bumpStat, composeAnalytics, recordTracksEvent } from 'state/analytics/actions';
import ClipboardButtonInput from 'components/clipboard-button-input';
import { CtaButton } from 'components/promo-section/promo-card/cta';

/**
 * Image dependencies
 */
import earnSectionImage from 'assets/images/earn/earn-section.svg';
import referralImage from 'assets/images/earn/referral.svg';

/**
 * Style dependencies
 */
import './style.scss';

interface ConnectedProps {
	siteId: number;
	selectedSiteSlug: SiteSlug;
	isJetpack: boolean;
	isAtomicSite: boolean;
	trackCtaButton: ( feature: string ) => void;
}

const wpcom = wp.undocumented();

const ReferAFriendSection: FunctionComponent< ConnectedProps > = ( {
	isJetpack,
	isAtomicSite,
	trackCtaButton,
} ) => {
	const translate = useTranslate();
	const [ peerReferralLink, setPeerReferralLink ] = useState( '' );

	useEffect( () => {
		if ( peerReferralLink ) return;
		wpcom.me().getPeerReferralLink( ( error: string, data: string ) => {
			setPeerReferralLink( ! error && data ? data : '' );
		} );
	}, [ peerReferralLink ] );

	const onPeerReferralCtaClick = () => {
		if ( peerReferralLink ) return;
		wpcom.me().setPeerReferralLinkEnable( true, ( error: string, data: string ) => {
			setPeerReferralLink( ! error && data ? data : '' );
		} );
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
			cta.component = <ClipboardButtonInput value={ peerReferralLink } />;
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

export default connect< ConnectedProps, {}, {} >(
	( state ) => {
		const selectedSiteSlug = getSelectedSiteSlug( state );
		const site = getSiteBySlug( state, selectedSiteSlug );
		return {
			siteId: site.ID,
			isJetpack: isJetpackSite( state, site.ID ),
			isAtomicSite: isSiteAutomatedTransfer( state, site.ID ),
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
