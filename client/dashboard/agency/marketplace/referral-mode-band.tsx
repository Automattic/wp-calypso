import { userPreferenceOptimisticMutation, userPreferenceQuery } from '@automattic/api-queries';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
	__experimentalHeading as Heading,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
	Button,
} from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useEffect, useRef } from 'react';
import { Card, CardBody } from '../../components/card';
import InlineSupportLink from '../../components/inline-support-link';
import addHostingArt from './images/referral/step-1-add-hosting.svg';
import addPressableArt from './images/referral/step-1-add-pressable.svg';
import addProductArt from './images/referral/step-1-add.svg';
import sendArt from './images/referral/step-2-send.svg';
import earnHostingArt from './images/referral/step-3-earn-hosting.svg';
import earnPressableArt from './images/referral/step-3-earn-pressable.svg';
import earnProductArt from './images/referral/step-3-earn.svg';

import './referral-mode-band.scss';

const FOLDED_PREFERENCE = 'a4a-marketplace-referral-band-folded';

const REFERRALS_HELP_URL =
	'https://agencieshelp.automattic.com/knowledge-base/referring-products-to-clients/';

export type ReferralModeBandKind = 'products' | 'hosting' | 'pressable';

const getCopy = ( kind: ReferralModeBandKind ) => {
	if ( kind === 'products' ) {
		return {
			headline: __( 'Your client pays the retail price. You earn up to 50% recurring commission.' ),
			summary: __(
				/* translators: <strong> marks the status at the start of the sentence. */
				'<strong>Referring to clients.</strong> Your client pays. You earn up to 50% recurring commission.'
			),
			addStep: __( 'Add products to a referral cart' ),
			addArt: addProductArt,
			earnArt: earnProductArt,
		};
	}
	return {
		headline: __(
			'Your client pays the retail price. You earn 20% recurring commission on their hosting.'
		),
		summary: __(
			/* translators: <strong> marks the status at the start of the sentence. */
			'<strong>Referring to clients.</strong> Your client pays. You earn 20% recurring commission on hosting.'
		),
		addStep: __( 'Add hosting to a referral cart' ),
		addArt: kind === 'pressable' ? addPressableArt : addHostingArt,
		earnArt: kind === 'pressable' ? earnPressableArt : earnHostingArt,
	};
};

export default function ReferralModeBand( { kind }: { kind: ReferralModeBandKind } ) {
	const { data: isFolded } = useQuery( userPreferenceQuery( FOLDED_PREFERENCE ) );
	const { mutate: setFolded } = useMutation(
		userPreferenceOptimisticMutation( FOLDED_PREFERENCE )
	);
	const copy = getCopy( kind );

	// Folding swaps the whole band, so focus follows to the button that undoes it.
	const gotItRef = useRef< HTMLButtonElement >( null );
	const howItWorksRef = useRef< HTMLButtonElement >( null );
	const shouldMoveFocus = useRef( false );
	useEffect( () => {
		if ( ! shouldMoveFocus.current ) {
			return;
		}
		shouldMoveFocus.current = false;
		( isFolded ? howItWorksRef : gotItRef ).current?.focus();
	}, [ isFolded ] );

	const toggleFolded = ( folded: boolean ) => {
		shouldMoveFocus.current = true;
		setFolded( folded );
	};

	if ( isFolded ) {
		return (
			<Card className="referral-mode-band" size="small">
				<CardBody>
					<HStack spacing={ 3 } justify="flex-start" wrap>
						<Text className="referral-mode-band__status">
							{ createInterpolateElement( copy.summary, { strong: <strong /> } ) }
						</Text>
						<Button ref={ howItWorksRef } variant="link" onClick={ () => toggleFolded( false ) }>
							{ __( 'How it works' ) }
						</Button>
					</HStack>
				</CardBody>
			</Card>
		);
	}

	const steps = [
		{ art: copy.addArt, caption: copy.addStep },
		{ art: sendArt, caption: __( 'Send your client a payment request' ) },
		{ art: copy.earnArt, caption: __( 'Earn quarterly on active subscriptions' ) },
	];

	return (
		<Card className="referral-mode-band">
			<div className="referral-mode-band__layout">
				<VStack spacing={ 3 } alignment="topLeft" className="referral-mode-band__intro">
					<Text
						className="referral-mode-band__status"
						size={ 12 }
						weight={ 500 }
						color="var( --referral-mode-band-theme )"
					>
						{ __( 'Referral mode is on' ) }
					</Text>
					<Heading level={ 2 } size={ 15 } weight={ 500 } className="referral-mode-band__headline">
						{ copy.headline }
					</Heading>
					<HStack spacing={ 4 } justify="flex-start" expanded={ false }>
						<Button
							ref={ gotItRef }
							variant="secondary"
							size="compact"
							onClick={ () => toggleFolded( true ) }
						>
							{ __( 'Got it' ) }
						</Button>
						<InlineSupportLink supportLink={ REFERRALS_HELP_URL } forceOpenInHelpCenter />
					</HStack>
				</VStack>
				<ol className="referral-mode-band__steps">
					{ steps.map( ( step ) => (
						<li key={ step.caption } className="referral-mode-band__step">
							<img className="referral-mode-band__art" src={ step.art } alt="" />
							<Text className="referral-mode-band__caption">{ step.caption }</Text>
						</li>
					) ) }
				</ol>
			</div>
		</Card>
	);
}
