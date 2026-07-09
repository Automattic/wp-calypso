import {
	Button,
	Modal,
	__experimentalHeading as Heading,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import {
	Icon,
	category,
	color,
	tag,
	globe,
	close,
	plus,
	check,
	arrowRight,
	search,
} from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import { StepIndicator } from 'calypso/reader/components/step-indicator';
import { useDispatch } from 'calypso/state';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';
import { READER_SPACES_ONBOARDING_TRACKS_EVENT_PREFIX } from './constants';

import './style.scss';

// Ties the hidden Modal header's accessible name to a screen-reader heading.
const HEADING_ID = 'reader-spaces-onboarding__heading';

// Stable (untranslated) names reported in analytics for each step index.
const STEP_NAMES = [ 'welcome', 'explain', 'discover' ];
const TOTAL_STEPS = STEP_NAMES.length;

// Example spaces used purely to illustrate the concept. The accent colors are
// data, not theme tokens, so they stay as inline styles rather than CSS.
const EXAMPLE_SPACES: { icon: JSX.Element; color: string }[] = [
	{ icon: category, color: '#3858e9' },
	{ icon: globe, color: '#0ea5b7' },
	{ icon: color, color: '#ea8009' },
	{ icon: tag, color: '#d6336c' },
];

function SpaceTile( {
	icon,
	accent,
	size = 44,
}: {
	icon: JSX.Element;
	accent: string;
	size?: number;
} ) {
	return (
		<span
			className="reader-spaces-onboarding__tile"
			style={ { background: accent, inlineSize: size, blockSize: size } }
			aria-hidden="true"
		>
			<Icon icon={ icon } size={ Math.round( size * 0.5 ) } />
		</span>
	);
}

/* ---- Step 1: welcome ---- */
function StepWelcome() {
	const translate = useTranslate();
	return (
		<VStack spacing={ 5 } alignment="center" className="reader-spaces-onboarding__pane is-center">
			<HStack
				justify="center"
				spacing={ 3 }
				expanded={ false }
				className="reader-spaces-onboarding__hero"
			>
				{ EXAMPLE_SPACES.map( ( space, i ) => (
					<SpaceTile key={ i } icon={ space.icon } accent={ space.color } />
				) ) }
			</HStack>
			<VStack spacing={ 2 } alignment="center">
				<Heading level={ 1 } align="center">
					{ translate( 'Meet Spaces' ) }
				</Heading>
				<Text align="center">
					{ translate(
						'{{b}}Spaces{{/b}} let you group the sites and tags you follow into separate feeds, so you can read one topic at a time.',
						{ components: { b: <b /> } }
					) }
				</Text>
			</VStack>
		</VStack>
	);
}

/* ---- Step 2: how it works ---- */
function StepExplain() {
	const translate = useTranslate();
	const points = [
		translate( 'Put related sites in the same Space' ),
		translate( 'Give each Space its own layout and color' ),
		translate( 'Open a Space when you want to read that topic' ),
	];
	return (
		<VStack spacing={ 5 } className="reader-spaces-onboarding__pane">
			<Heading level={ 1 } size={ 20 }>
				{ translate( 'Sort your feeds by topic' ) }
			</Heading>

			<HStack spacing={ 4 } alignment="center" className="reader-spaces-onboarding__diagram">
				<VStack spacing={ 2 } className="reader-spaces-onboarding__panel">
					<Text size={ 11 } weight={ 600 } upperCase variant="muted">
						{ translate( 'All your follows' ) }
					</Text>
					<div className="reader-spaces-onboarding__jumble" aria-hidden="true">
						{ Array.from( { length: 9 } ).map( ( _, i ) => (
							<span key={ i } className="reader-spaces-onboarding__glyph" />
						) ) }
					</div>
				</VStack>
				<Icon
					className="reader-spaces-onboarding__arrow"
					icon={ arrowRight }
					size={ 24 }
					aria-hidden="true"
				/>
				<VStack spacing={ 2 } className="reader-spaces-onboarding__panel">
					<Text size={ 11 } weight={ 600 } upperCase variant="muted">
						{ translate( 'Your Spaces' ) }
					</Text>
					<VStack spacing={ 1 }>
						{ EXAMPLE_SPACES.map( ( space, i ) => (
							<HStack
								key={ i }
								spacing={ 2 }
								justify="flex-start"
								className="reader-spaces-onboarding__space-row"
							>
								<SpaceTile icon={ space.icon } accent={ space.color } size={ 22 } />
								<span
									className="reader-spaces-onboarding__space-bar"
									style={ { background: space.color } }
									aria-hidden="true"
								/>
							</HStack>
						) ) }
					</VStack>
				</VStack>
			</HStack>

			<VStack spacing={ 3 } className="reader-spaces-onboarding__points">
				{ points.map( ( point, i ) => (
					<HStack key={ i } spacing={ 2 } justify="flex-start">
						<span className="reader-spaces-onboarding__tick" aria-hidden="true">
							<Icon icon={ check } size={ 16 } />
						</span>
						<Text>{ point }</Text>
					</HStack>
				) ) }
			</VStack>
		</VStack>
	);
}

/* ---- Step 3: discover ---- */
function StepDiscover() {
	const translate = useTranslate();
	return (
		<VStack spacing={ 4 } alignment="center" className="reader-spaces-onboarding__pane is-center">
			<span className="reader-spaces-onboarding__badge" aria-hidden="true">
				<Icon icon={ search } size={ 32 } />
			</span>
			<VStack spacing={ 2 } alignment="center">
				<Heading level={ 1 } align="center">
					{ translate( 'Find more with Discover' ) }
				</Heading>
				<Text align="center">
					{ translate(
						'Every Space has its own Discover, with recommended posts on that topic. It’s an easy way to find new sites worth following.'
					) }
				</Text>
			</VStack>
		</VStack>
	);
}

interface Props {
	/** Final CTA — the parent closes this modal and opens the create-space form. */
	onProceed: () => void;
	/** Dismiss (X / Esc / backdrop / Skip) — the parent closes this modal only. */
	onClose: () => void;
}

/**
 * First-time walkthrough that explains Reader Spaces before the create-space
 * form appears. Mounted only when it should show (the parent gates it on a
 * "seen" preference), so it renders open and lazy-loads on demand.
 */
export function SpacesOnboardingModal( { onProceed, onClose }: Props ) {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const [ step, setStep ] = useState( 0 );

	const isLastStep = step === TOTAL_STEPS - 1;

	// Record each step as it becomes visible (including the initial one).
	useEffect( () => {
		dispatch(
			recordReaderTracksEvent( `${ READER_SPACES_ONBOARDING_TRACKS_EVENT_PREFIX }step_viewed`, {
				step,
				step_name: STEP_NAMES[ step ],
			} )
		);
	}, [ step, dispatch ] );

	// Skip / dismiss (X, Skip button, Esc, backdrop) — record where they left off.
	const handleClose = () => {
		dispatch(
			recordReaderTracksEvent( `${ READER_SPACES_ONBOARDING_TRACKS_EVENT_PREFIX }skipped`, {
				step,
				step_name: STEP_NAMES[ step ],
			} )
		);
		onClose();
	};

	const goBack = () => setStep( ( s ) => Math.max( s - 1, 0 ) );
	const goNext = () => {
		if ( isLastStep ) {
			onProceed();
			return;
		}
		setStep( ( s ) => Math.min( s + 1, TOTAL_STEPS - 1 ) );
	};

	let primaryLabel;
	if ( step === 0 ) {
		primaryLabel = translate( 'Show me how' );
	} else if ( isLastStep ) {
		primaryLabel = translate( 'Create a space' );
	} else {
		primaryLabel = translate( 'Next' );
	}

	return (
		<Modal
			size="medium"
			__experimentalHideHeader
			onRequestClose={ handleClose }
			className="reader-spaces-onboarding"
			aria={ { labelledby: HEADING_ID } }
		>
			<h2 id={ HEADING_ID } className="screen-reader-text">
				{ translate( 'Set up Spaces' ) }
			</h2>
			<Button
				className="reader-spaces-onboarding__close"
				icon={ close }
				label={ translate( 'Close' ) }
				onClick={ handleClose }
			/>

			<VStack spacing={ 6 }>
				{ step === 0 && <StepWelcome /> }
				{ step === 1 && <StepExplain /> }
				{ step === 2 && <StepDiscover /> }

				<HStack className="reader-spaces-onboarding__footer" justify="flex-start">
					<StepIndicator totalSteps={ TOTAL_STEPS } currentStep={ step + 1 } />
					<HStack
						className="reader-spaces-onboarding__footer-actions"
						spacing={ 2 }
						justify="flex-end"
						expanded={ false }
					>
						{ step === 0 ? (
							<Button variant="tertiary" onClick={ handleClose }>
								{ translate( 'Skip' ) }
							</Button>
						) : (
							<Button variant="tertiary" onClick={ goBack }>
								{ translate( 'Back' ) }
							</Button>
						) }
						<Button
							__next40pxDefaultSize
							variant="primary"
							icon={ isLastStep ? plus : undefined }
							onClick={ goNext }
						>
							{ primaryLabel }
						</Button>
					</HStack>
				</HStack>
			</VStack>
		</Modal>
	);
}

export default SpacesOnboardingModal;
