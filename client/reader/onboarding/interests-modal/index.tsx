import { recordTracksEvent } from '@automattic/calypso-analytics';
import { SelectCardCheckbox } from '@automattic/onboarding';
import { Modal, Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch, useStore } from 'react-redux';
import { READER_ONBOARDING_TRACKS_EVENT_PREFIX } from 'calypso/reader/onboarding/constants';
import { requestFollowTag, requestUnfollowTag } from 'calypso/state/reader/tags/items/actions';
import { getReaderFollowedTags } from 'calypso/state/reader/tags/selectors';

import './style.scss';

interface InterestsModalProps {
	isOpen: boolean;
	onClose: () => void;
	onContinue: () => void;
}

interface Topic {
	name: string;
	tag: string;
}

interface Category {
	name: string;
	topics: Topic[];
}

interface Tag {
	slug: string;
}

const InterestsModal: React.FC< InterestsModalProps > = ( { isOpen, onClose, onContinue } ) => {
	const [ followedTags, setFollowedTags ] = useState< string[] >( [] );
	const followedTagsFromState = useSelector( getReaderFollowedTags );
	const dispatch = useDispatch();
	const [ processingTags, setProcessingTags ] = useState< Set< string > >( new Set() );
	const reduxStore = useStore();

	useEffect( () => {
		// If there are followed tags in the state and no tags are being processed, update the followed tags state for the UI.
		if ( followedTagsFromState && processingTags.size === 0 ) {
			const initialTags = followedTagsFromState.map( ( tag: Tag ) => tag.slug );
			setFollowedTags( initialTags );
		}
	}, [ followedTagsFromState, processingTags ] );

	const isContinueDisabled = followedTags.length < 3;

	const handleTopicChange = ( checked: boolean, tag: string ) => {
		// If the tag is already being processed, do nothing.
		if ( processingTags.has( tag ) ) {
			return null;
		}

		// Mark the tag as being processed.
		setProcessingTags( ( current ) => new Set( current ).add( tag ) );

		// Follow or unfollow the tag and update the followed tags state for the UI.
		if ( checked ) {
			dispatch( requestFollowTag( tag ) );
			setFollowedTags( ( currentTags ) => [ ...currentTags, tag ] );
			recordTracksEvent( `${ READER_ONBOARDING_TRACKS_EVENT_PREFIX }interests_modal_tag_followed`, {
				tag,
				total_followed: followedTags.length + 1,
			} );
		} else {
			dispatch( requestUnfollowTag( tag ) );
			setFollowedTags( ( currentTags ) => currentTags.filter( ( t ) => t !== tag ) );
			recordTracksEvent(
				`${ READER_ONBOARDING_TRACKS_EVENT_PREFIX }interests_modal_tag_unfollowed`,
				{
					tag,
					total_followed: followedTags.length - 1,
				}
			);
		}

		// Set a maximum number of attempts to check if the tag has been processed.
		let attempts = 0;
		const MAX_ATTEMPTS = 100; // 100 * 100ms = 10 seconds

		// Poll to check if the tag has been processed (followed or unfollowed).
		const checkStateInterval = setInterval( () => {
			attempts++;

			// Get the current followed tags from the state.
			const currentFollowedTags = getReaderFollowedTags( reduxStore.getState() ) || [];
			const stateTagSlugs = currentFollowedTags.map( ( t: Tag ) => t.slug );

			// Check if the tag is now being followed or unfollowed.
			const isStateUpdated = checked
				? stateTagSlugs.includes( tag )
				: ! stateTagSlugs.includes( tag );

			// If the state has been updated or we've reached the maximum number of attempts, clear the interval and remove the tag from the processing set.
			if ( isStateUpdated || attempts >= MAX_ATTEMPTS ) {
				clearInterval( checkStateInterval );
				setProcessingTags( ( current ) => {
					const updated = new Set( current );
					updated.delete( tag );
					return updated;
				} );
			}
		}, 100 );
	};

	const handleContinue = () => {
		if ( ! isContinueDisabled ) {
			onClose();
			onContinue();
		}
	};

	const categories: Category[] = [
		{
			name: __( 'Lifestyle & Personal Development' ),
			topics: [
				{ name: __( 'Health' ), tag: 'health' },
				{ name: __( 'Personal Finance' ), tag: 'personal-finance' },
				{ name: __( 'Food' ), tag: 'food' },
				{ name: __( 'Life Hacks' ), tag: 'life-hacks' },
				{ name: __( 'Mental Health' ), tag: 'mental-health' },
				{ name: __( 'Sleep' ), tag: 'sleep' },
				{ name: __( 'Relationships' ), tag: 'relationships' },
				{ name: __( 'Parenting' ), tag: 'parenting' },
				{ name: __( 'Travel' ), tag: 'travel' },
			],
		},
		{
			name: __( 'Technology & Innovation' ),
			topics: [
				{ name: __( 'Gadgets' ), tag: 'gadgets' },
				{ name: __( 'Software' ), tag: 'software' },
				{ name: __( 'Tech News' ), tag: 'technology' },
				{ name: __( 'Design' ), tag: 'design' },
				{ name: __( 'Artificial Intelligence' ), tag: 'artificial-intelligence' },
				{ name: __( 'Cybersecurity' ), tag: 'cybersecurity' },
				{ name: __( 'Gaming' ), tag: 'gaming' },
				{ name: __( 'Crypto' ), tag: 'cryptocurrency' },
				{ name: __( 'Science' ), tag: 'science' },
			],
		},
		{
			name: __( 'Creative Arts & Entertainment' ),
			topics: [
				{ name: __( 'Music' ), tag: 'music' },
				{ name: __( 'Movies' ), tag: 'movies' },
				{ name: __( 'Books' ), tag: 'books' },
				{ name: __( 'Art' ), tag: 'art' },
				{ name: __( 'Theatre & Performance' ), tag: 'theatre' },
				{ name: __( 'Creative Writing' ), tag: 'writing' },
				{ name: __( 'Architecture' ), tag: 'architecture' },
				{ name: __( 'Photography' ), tag: 'photography' },
				{ name: __( 'DIY Projects' ), tag: 'diy' },
			],
		},
		{
			name: __( 'Society & Culture' ),
			topics: [
				{ name: __( 'Education' ), tag: 'education' },
				{ name: __( 'Nature' ), tag: 'nature' },
				{ name: __( 'Future' ), tag: 'future' },
				{ name: __( 'Politics' ), tag: 'politics' },
				{ name: __( 'Climate' ), tag: 'climate-change' },
				{ name: __( 'History' ), tag: 'history' },
				{ name: __( 'Society' ), tag: 'society' },
				{ name: __( 'Culture' ), tag: 'culture' },
				{ name: __( 'Philosophy' ), tag: 'philosophy' },
			],
		},
		{
			name: __( 'Industry' ),
			topics: [
				{ name: __( 'Business' ), tag: 'business' },
				{ name: __( 'Startups' ), tag: 'startups' },
				{ name: __( 'Finance' ), tag: 'finance' },
				{ name: __( 'Space' ), tag: 'space' },
				{ name: __( 'Leadership' ), tag: 'leadership' },
				{ name: __( 'Marketing' ), tag: 'marketing' },
				{ name: __( 'Remote Work' ), tag: 'remote-work' },
				{ name: __( 'SaaS' ), tag: 'saas' },
				{ name: __( 'Creator Economy' ), tag: 'creator-economy' },
			],
		},
	];

	const headerActions = (
		<>
			<Button onClick={ onClose } variant="link">
				{ __( 'Cancel' ) }
			</Button>
			<Button onClick={ handleContinue } variant="primary" disabled={ isContinueDisabled }>
				{ __( 'Continue' ) }
			</Button>
		</>
	);

	return (
		isOpen && (
			<Modal
				onRequestClose={ onClose }
				isFullScreen
				headerActions={ headerActions }
				isDismissible={ false }
				className="interests-modal"
			>
				<div className="interests-modal__content">
					<h2 className="interests-modal__title">{ __( 'What topics interest you?' ) }</h2>
					<p className="interests-modal__subtitle">
						{ __( 'Follow at least 3 topics to personalize your Reader feed.' ) }
					</p>
					{ categories.map( ( category ) => (
						<div key={ category.name } className="interests-modal__category">
							<h3 className="interests-modal__section-header">{ category.name }</h3>
							<div className="interests-modal__topics-list">
								{ category.topics.map( ( topic ) => (
									<SelectCardCheckbox
										key={ topic.name }
										onChange={ ( checked ) => handleTopicChange( checked, topic.tag ) }
										checked={
											Array.isArray( topic.tag )
												? topic.tag.every( ( t ) => followedTags.includes( t ) )
												: followedTags.includes( topic.tag )
										}
									>
										{ topic.name }
									</SelectCardCheckbox>
								) ) }
							</div>
						</div>
					) ) }
				</div>
			</Modal>
		)
	);
};

export default InterestsModal;
