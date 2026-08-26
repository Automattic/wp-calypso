import {
	Button,
	RadioControl,
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { Icon, check } from '@wordpress/icons';
import { useState } from 'react';
import { StepIndicator } from 'calypso/reader/components/step-indicator';

import './style.scss';

interface EarlyReadersModalProps {
	// Switches the copy between the "has a blog" and "no site yet" variants.
	hasSite: boolean;
	// Owned by the parent because it also governs the modal frame's Back button
	// and whether the dismiss path records a decline.
	hasJoined: boolean;
	totalSteps?: number;
	onDecline: () => void;
	onJoin: () => void;
	onFinish: () => void;
}

// Defaults to `decline` so the primary button's default action is to leave the
// program, not to enter it: a user clicking through the flow on muscle memory
// opts out rather than joining something they never read.
type Choice = 'join' | 'decline';

// Copy for both variants. Built per render rather than hoisted to module scope
// because `__()` must run after the locale loads.
const getCopy = ( hasSite: boolean ) =>
	hasSite
		? {
				subtitle: __(
					'We’ll put you in a group with four other people starting a blog this week, and you’ll read each other’s first posts.'
				),
				doneSubtitle: __(
					'We’ll email you as soon as your group is ready, usually within a few days.'
				),
				steps: [
					__( 'We match you with four other new writers in your topic.' ),
					__( 'You get an email with links to their first posts.' ),
					__( 'Subscribe, read, and leave each of them a comment.' ),
					__( 'They do the same for your post.' ),
				],
		  }
		: {
				subtitle: __(
					'Publish your first post and we’ll put you in a group with four other new writers, so you have readers waiting when you do.'
				),
				doneSubtitle: __(
					'We’ll email you once you publish your first post and your group is ready.'
				),
				steps: [
					__( 'Publish your first post whenever you’re ready.' ),
					__( 'We match you with four other new writers in your topic.' ),
					__( 'You get an email with links to their first posts.' ),
					__( 'Subscribe, read, and comment. They do the same for you.' ),
				],
		  };

const EarlyReadersOffer = ( {
	subtitle,
	choice,
	onChoiceChange,
}: {
	subtitle: string;
	choice: Choice;
	onChoiceChange: ( choice: Choice ) => void;
} ) => (
	<>
		<VStack spacing={ 2 } className="early-readers-modal__intro">
			<h2 className="early-readers-modal__title">{ __( 'Get your first readers' ) }</h2>
			<p className="early-readers-modal__subtitle">{ subtitle }</p>
		</VStack>

		<div className="early-readers-modal__deal">
			<div className="early-readers-modal__deal-card">
				<p className="early-readers-modal__deal-heading">{ __( 'What you get' ) }</p>
				<ul className="early-readers-modal__deal-list">
					<li>
						<span aria-hidden="true">📬</span>
						{ __( 'Four people who will read your first post' ) }
					</li>
					<li>
						<span aria-hidden="true">💬</span>
						{ __( 'A real comment from each of them, not just a like' ) }
					</li>
					<li>
						<span aria-hidden="true">👀</span>
						{ __( 'Four new subscribers to start you off' ) }
					</li>
				</ul>
			</div>
			<div className="early-readers-modal__deal-card is-ask">
				<p className="early-readers-modal__deal-heading">{ __( 'What you agree to' ) }</p>
				<ol className="early-readers-modal__agree-list">
					<li>{ __( 'Subscribe to your four writers' ) }</li>
					<li>{ __( 'Read their first posts' ) }</li>
					<li>{ __( 'Leave each of them a comment worth reading' ) }</li>
				</ol>
				<p className="early-readers-modal__time-note">{ __( 'Takes about 20 minutes, once.' ) }</p>
			</div>
		</div>

		<div className="early-readers-modal__choice">
			<RadioControl
				label={ __( 'Would you like to join?' ) }
				selected={ choice }
				options={ [
					{ label: __( 'Sign me up' ), value: 'join' },
					{ label: __( 'I’m not interested' ), value: 'decline' },
				] }
				onChange={ ( next ) => onChoiceChange( next === 'join' ? 'join' : 'decline' ) }
			/>
		</div>
	</>
);

const EarlyReadersConfirmation = ( { subtitle, steps }: { subtitle: string; steps: string[] } ) => (
	<VStack spacing={ 4 } className="early-readers-modal__done">
		<div className="early-readers-modal__done-check">
			<Icon icon={ check } size={ 26 } />
		</div>
		<h2 className="early-readers-modal__title">{ __( 'You’re in' ) }</h2>
		<p className="early-readers-modal__subtitle">{ subtitle }</p>
		<ol className="early-readers-modal__next-steps">
			{ steps.map( ( step ) => (
				<li key={ step }>{ step }</li>
			) ) }
		</ol>
	</VStack>
);

// Renders the body of the "early-readers" step. The shared <Modal> wrapper is
// provided by the parent (`ReaderOnboardingRsm`) so transitions between steps
// don't unmount/remount the modal frame.
export const EarlyReadersModal = ( {
	hasSite,
	hasJoined,
	totalSteps = 4,
	onDecline,
	onJoin,
	onFinish,
}: EarlyReadersModalProps ) => {
	const [ choice, setChoice ] = useState< Choice >( 'decline' );

	const copy = getCopy( hasSite );

	return (
		<>
			<VStack spacing={ 8 } className="early-readers-modal__content">
				{ hasJoined ? (
					<EarlyReadersConfirmation subtitle={ copy.doneSubtitle } steps={ copy.steps } />
				) : (
					<EarlyReadersOffer
						subtitle={ copy.subtitle }
						choice={ choice }
						onChoiceChange={ setChoice }
					/>
				) }
			</VStack>

			<div className="reader-onboarding-modal__footer">
				<HStack justify="space-between" className="reader-onboarding-modal__footer-actions">
					<StepIndicator totalSteps={ totalSteps } currentStep={ 4 } />
					<HStack spacing={ 2 } justify="right" className="reader-onboarding-modal__footer-buttons">
						{ hasJoined ? (
							<Button __next40pxDefaultSize variant="primary" onClick={ onFinish }>
								{ __( 'Back to Reader' ) }
							</Button>
						) : (
							<Button
								__next40pxDefaultSize
								variant="primary"
								onClick={ choice === 'join' ? onJoin : onDecline }
							>
								{ choice === 'join' ? __( 'Join Early Readers' ) : __( 'Finish' ) }
							</Button>
						) }
					</HStack>
				</HStack>
			</div>
		</>
	);
};
