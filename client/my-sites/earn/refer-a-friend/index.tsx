import { localizeUrl } from '@automattic/i18n-utils';
import { useTranslate } from 'i18n-calypso';
import { compact } from 'lodash';
import { Fragment, useState, useEffect } from 'react';
import earnSectionImage from 'calypso/assets/images/earn/earn-section.svg';
import referralImage from 'calypso/assets/images/earn/referral.svg';
import ClipboardButtonInput from 'calypso/components/clipboard-button-input';
import PromoSection, { Props as PromoSectionProps } from 'calypso/components/promo-section';
import { CtaButton } from 'calypso/components/promo-section/promo-card/cta';
import wp from 'calypso/lib/wp';
import { useSelector } from 'calypso/state';
import { bumpStat, composeAnalytics, recordTracksEvent } from 'calypso/state/analytics/actions';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';

import './style.scss';

const ReferAFriendSection = () => {
	const translate = useTranslate();
	const [ peerReferralLink, setPeerReferralLink ] = useState( '' );
	const site = useSelector( ( state ) => getSelectedSite( state ) );
	const isJetpack = useSelector( ( state ) => isJetpackSite( state, site?.ID ) );
	const isAtomicSite = useSelector( ( state ) => isSiteAutomatedTransfer( state, site?.ID ) );

	const trackCtaButton = ( feature: string ) => {
		composeAnalytics(
			recordTracksEvent( 'calypso_earn_page_cta_button_click', { feature } ),
			bumpStat( 'calypso_earn_page', 'cta-button-' + feature )
		);
	};

	useEffect( () => {
		if ( peerReferralLink ) {
			return;
		}
		wp.req.get( '/me/peer-referral-link', ( error: string, data: string ) => {
			setPeerReferralLink( ! error && data ? data : '' );
		} );
	}, [ peerReferralLink ] );

	const onPeerReferralCtaClick = () => {
		if ( peerReferralLink ) {
			return;
		}
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

export default ReferAFriendSection;
