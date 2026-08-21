import {
	Button,
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import clsx from 'clsx';
import { useState } from 'react';
import { StepIndicator } from 'calypso/reader/components/step-indicator';

import './style.scss';

interface EarlyReadersModalProps {
	// Whether the user already has a site — switches the copy between the
	// "has a blog" and "no site yet" variants of the pitch.
	hasSite: boolean;
	// Whether the user has opted in, which swaps this step for its
	// confirmation state. Owned by the parent because it also governs the
	// modal frame's Back button and the dismiss path's decline event.
	hasJoined: boolean;
	onDecline: () => void;
	// Called with the selected interest slug when the user joins.
	onJoin: ( interest: string ) => void;
	// Called from the confirmation state's "Back to Reader" button.
	onFinish: () => void;
}

// Renders the body of the "early-readers" step — the Early Readers Program
// opt-in screen shown after discover for the treatment variation of the
// calypso_reader_early_readers_v0 experiment. The shared <Modal> wrapper is
// provided by the parent (`ReaderOnboardingRsm`) so transitions between
// steps don't unmount/remount the modal frame.
export const EarlyReadersModal = ( {
	hasSite,
	hasJoined,
	onDecline,
	onJoin,
	onFinish,
}: EarlyReadersModalProps ) => {
	const [ selectedInterest, setSelectedInterest ] = useState< string | null >( null );

	const interests = [
		{ slug: 'travel-world', emoji: '✈️', label: __( 'Travel' ) },
		{ slug: 'food-drinks', emoji: '🍜', label: __( 'Food & drink' ) },
		{ slug: 'photography-arts', emoji: '📷', label: __( 'Photography & art' ) },
		{ slug: 'nature-science', emoji: '🌿', label: __( 'Nature & science' ) },
		{ slug: 'music-culture', emoji: '🎧', label: __( 'Music & culture' ) },
	];

	const copy = hasSite
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

	const handleJoin = () => {
		if ( ! selectedInterest ) {
			return;
		}
		onJoin( selectedInterest );
	};

	return (
		<>
			<VStack spacing={ 8 } className="early-readers-modal__content">
				{ ! hasJoined && (
					<>
						<VStack spacing={ 2 } className="early-readers-modal__intro">
							<h2 className="early-readers-modal__title">{ __( 'Get your first readers' ) }</h2>
							<p className="early-readers-modal__subtitle">{ copy.subtitle }</p>
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
								<p className="early-readers-modal__time-note">
									{ __( 'Takes about 20 minutes, once.' ) }
								</p>
							</div>
						</div>

						<VStack spacing={ 1 } className="early-readers-modal__picker">
							<p className="early-readers-modal__picker-label">
								{ __( 'What are you writing about?' ) }
							</p>
							<p className="early-readers-modal__picker-help">
								{ __(
									'We group people by topic so you’re reading things you actually care about.'
								) }
							</p>
							<div
								className="early-readers-modal__chips"
								role="group"
								aria-label={ __( 'Choose a topic' ) }
							>
								{ interests.map( ( interest ) => {
									const isSelected = selectedInterest === interest.slug;
									return (
										<button
											key={ interest.slug }
											type="button"
											className={ clsx( 'early-readers-modal__chip', {
												'is-selected': isSelected,
											} ) }
											aria-pressed={ isSelected }
											onClick={ () => setSelectedInterest( interest.slug ) }
										>
											<span className="early-readers-modal__chip-emoji" aria-hidden="true">
												{ interest.emoji }
											</span>
											{ interest.label }
										</button>
									);
								} ) }
							</div>
						</VStack>
					</>
				) }

				{ hasJoined && (
					<VStack spacing={ 4 } className="early-readers-modal__done">
						<div className="early-readers-modal__done-check" aria-hidden="true">
							<svg width="26" height="26" viewBox="0 0 24 24" fill="none">
								<path
									d="M5 12.5l4.5 4.5L19 7.5"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
								/>
							</svg>
						</div>
						<h2 className="early-readers-modal__title">{ __( 'You’re in' ) }</h2>
						<p className="early-readers-modal__subtitle">{ copy.doneSubtitle }</p>
						<ol className="early-readers-modal__next-steps">
							{ copy.steps.map( ( step ) => (
								<li key={ step }>{ step }</li>
							) ) }
						</ol>
					</VStack>
				) }
			</VStack>

			<div className="reader-onboarding-modal__footer">
				<HStack justify="space-between" className="reader-onboarding-modal__footer-actions">
					<StepIndicator totalSteps={ 4 } currentStep={ 4 } />
					<HStack spacing={ 2 } justify="right" className="reader-onboarding-modal__footer-buttons">
						{ hasJoined ? (
							<Button __next40pxDefaultSize variant="primary" onClick={ onFinish }>
								{ __( 'Back to Reader' ) }
							</Button>
						) : (
							<>
								<Button __next40pxDefaultSize variant="tertiary" onClick={ onDecline }>
									{ __( 'No thanks' ) }
								</Button>
								<Button
									__next40pxDefaultSize
									variant="primary"
									disabled={ ! selectedInterest }
									onClick={ handleJoin }
								>
									{ __( 'Join Early Readers' ) }
								</Button>
							</>
						) }
					</HStack>
				</HStack>
			</div>
		</>
	);
};
