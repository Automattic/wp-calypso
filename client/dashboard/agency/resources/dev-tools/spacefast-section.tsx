import {
	Button,
	Icon,
	__experimentalHeading as Heading,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { check, pause, play } from '@wordpress/icons';
import { Badge } from '@wordpress/ui';
import clsx from 'clsx';
import { useCallback, useState } from 'react';
import { Card, CardBody } from '../../../components/card';
import { isSpacefastPromoEnabled } from '../../components/spacefast/constants';
import SpacefastLogo from '../../components/spacefast/spacefast-logo';
import { useRecordViewOnce } from '../../lib/use-record-view-once';
import designQuestionnaireImage from './images/spacefast-design-questionnaire.webp';
import homepageConceptsImage from './images/spacefast-homepage-concepts.webp';
import projectTrackerImage from './images/spacefast-project-tracker.webp';
import SpacefastTermsModal from './spacefast-terms-modal';
import type { RecordTracksEvent } from '../../tiers/types';

import './spacefast-section.scss';

/**
 * Leads the Dev tools page during the Spacefast launch, in both the dashboard
 * and a8c-for-agencies. It follows the page's dev tool cards, laid out wide.
 */
export default function SpacefastDevToolsSection( {
	recordTracksEvent,
}: {
	recordTracksEvent: RecordTracksEvent;
} ) {
	if ( ! isSpacefastPromoEnabled() ) {
		return null;
	}
	return <SpacefastDevToolsCard recordTracksEvent={ recordTracksEvent } />;
}

function SpacefastDevToolsCard( { recordTracksEvent }: { recordTracksEvent: RecordTracksEvent } ) {
	useRecordViewOnce(
		'spacefast-dev-tools',
		useCallback(
			() => recordTracksEvent( 'calypso_a4a_spacefast_promo_view', { placement: 'dev_tools' } ),
			[ recordTracksEvent ]
		)
	);

	const [ isTermsOpen, setIsTermsOpen ] = useState( false );
	const [ isPaused, setIsPaused ] = useState( false );

	// Sample spaces from spacefast.com/for/agencies, shown in turn after the logo.
	const samples = [
		{ image: designQuestionnaireImage, label: __( 'Design briefs' ) },
		{ image: homepageConceptsImage, label: __( 'Homepage comparisons' ) },
		{ image: projectTrackerImage, label: __( 'Project trackers' ) },
	];

	const features = [
		__(
			'As an Automattic for Agencies partner, you get an exclusive invitation: 30 days of Spacefast Pro free, plus 30 more days when you create your first space'
		),
		__(
			'Build client sites, prototypes, and internal agency tooling with database support, file uploads, and versioning included'
		),
		__(
			'Integrates seamlessly with the AI your team already uses, like Claude, ChatGPT, or Gemini'
		),
		__(
			'Keep client work safe in private spaces you invite people to, or make a space public and share it with the world'
		),
		__(
			'Made by Automattic and built on the infrastructure that runs Pressable, WordPress.com, and more'
		),
	];

	return (
		<Card size="large" className="a4a-spacefast-dev-tools">
			<div className="a4a-spacefast-dev-tools__layout">
				<div className={ clsx( 'a4a-spacefast-dev-tools__media', { 'is-paused': isPaused } ) }>
					<SpacefastLogo className="a4a-spacefast-dev-tools__logo" />
					<SpacefastLogo className="a4a-spacefast-dev-tools__logo-badge" />
					<span className="a4a-spacefast-dev-tools__captions" aria-hidden="true">
						{ samples.map( ( { label } ) => (
							<span key={ label } className="a4a-spacefast-dev-tools__caption">
								{ label }
							</span>
						) ) }
						<span className="a4a-spacefast-dev-tools__tagline">
							{ __( 'Build anything. Live in seconds.' ) }
						</span>
					</span>
					{ samples.map( ( { image } ) => (
						<img
							key={ image }
							className="a4a-spacefast-dev-tools__sample"
							src={ image }
							alt=""
							decoding="async"
						/>
					) ) }
					<Button
						className="a4a-spacefast-dev-tools__playback"
						icon={ isPaused ? play : pause }
						label={ isPaused ? __( 'Play' ) : __( 'Pause' ) }
						size="small"
						onClick={ () => setIsPaused( ! isPaused ) }
					/>
				</div>
				<CardBody>
					<VStack spacing={ 4 } alignment="flex-start">
						<VStack spacing={ 2 }>
							<HStack alignment="left" wrap>
								<Heading level={ 2 } size={ 20 } weight={ 500 }>
									{ __( 'Spacefast' ) }
								</Heading>
								<Badge intent="stable">{ __( 'New' ) }</Badge>
								<Badge intent="draft">{ __( 'Build with AI' ) }</Badge>
							</HStack>
						</VStack>
						<Text size={ 15 }>
							{ __(
								'Your team already uses AI to make websites, apps, prototypes, proposals, and more. Spacefast gives your team one shared place to ship them in seconds, right from your agent and ready for clients to see.'
							) }
						</Text>
						<VStack as="ul" role="list" spacing={ 1 } className="a4a-spacefast-dev-tools__features">
							{ features.map( ( feature ) => (
								<HStack as="li" key={ feature } alignment="topLeft" spacing={ 1 }>
									<Icon icon={ check } size={ 24 } className="a4a-spacefast-dev-tools__check" />
									<Text size={ 15 } lineHeight="24px">
										{ feature }
									</Text>
								</HStack>
							) ) }
						</VStack>
						<HStack alignment="left" spacing={ 4 } wrap>
							<Button
								__next40pxDefaultSize
								variant="primary"
								size="compact"
								href="https://my.spacefast.com/redeem/SPACEFAST-LAUNCH-213M"
								target="_blank"
								rel="noreferrer"
								onClick={ () =>
									recordTracksEvent( 'calypso_a4a_spacefast_promo_click', {
										placement: 'dev_tools',
									} )
								}
							>
								{ __( 'Start your 30 days' ) }
							</Button>
							<Button variant="link" onClick={ () => setIsTermsOpen( true ) }>
								{ __( 'Offer terms' ) }
							</Button>
						</HStack>
						{ isTermsOpen && <SpacefastTermsModal onClose={ () => setIsTermsOpen( false ) } /> }
					</VStack>
				</CardBody>
			</div>
		</Card>
	);
}
