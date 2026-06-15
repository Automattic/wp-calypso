import { followReadTagMutation, unfollowReadTagMutation } from '@automattic/api-queries';
import { recordTracksEvent } from '@automattic/calypso-analytics';
import { SelectCardCheckboxV2 } from '@automattic/onboarding';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
	Modal,
	Button,
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { fixMe, translate } from 'i18n-calypso';
import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useFollowedTags } from 'calypso/reader/data/tags';
import { READER_ONBOARDING_TRACKS_EVENT_PREFIX } from 'calypso/reader/onboarding/constants';
import { errorNotice } from 'calypso/state/notices/actions';

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

const InterestsModal: React.FC< InterestsModalProps > = ( { isOpen, onClose, onContinue } ) => {
	const [ followedTags, setFollowedTags ] = useState< string[] >( [] );
	const { data: followedTagsFromState } = useFollowedTags();
	const dispatch = useDispatch();
	const queryClient = useQueryClient();
	const [ processingTags, setProcessingTags ] = useState< Set< string > >( new Set() );
	const { mutate: followTag } = useMutation( followReadTagMutation( queryClient ) );
	const { mutate: unfollowTag } = useMutation( unfollowReadTagMutation( queryClient ) );

	useEffect( () => {
		// If there are followed tags in the state and no tags are being processed, update the followed tags state for the UI.
		if ( followedTagsFromState && processingTags.size === 0 ) {
			const initialTags = followedTagsFromState.map( ( tag ) => tag.slug );
			setFollowedTags( initialTags );
		}
	}, [ followedTagsFromState, processingTags ] );

	const isContinueDisabled = followedTags.length < 4;

	const handleTopicChange = ( checked: boolean, tag: string ) => {
		// If the tag is already being processed, do nothing.
		if ( processingTags.has( tag ) ) {
			return null;
		}

		// Mark the tag as being processed.
		setProcessingTags( ( current ) => new Set( current ).add( tag ) );

		const releaseProcessing = () => {
			setProcessingTags( ( current ) => {
				const updated = new Set( current );
				updated.delete( tag );
				return updated;
			} );
		};

		// Follow or unfollow the tag and update the followed tags state for the UI.
		if ( checked ) {
			followTag( tag, {
				onSettled: releaseProcessing,
				onError: () => {
					dispatch(
						errorNotice( translate( 'Could not follow tag: %(tag)s', { args: { tag } } ) )
					);
				},
			} );
			setFollowedTags( ( currentTags ) => [ ...currentTags, tag ] );
			recordTracksEvent( `${ READER_ONBOARDING_TRACKS_EVENT_PREFIX }interests_modal_tag_followed`, {
				tag,
				total_followed: followedTags.length + 1,
			} );
		} else {
			unfollowTag( tag, {
				onSettled: releaseProcessing,
				onError: () => {
					dispatch(
						errorNotice( translate( 'Could not unfollow tag: %(tag)s', { args: { tag } } ) )
					);
				},
			} );
			setFollowedTags( ( currentTags ) => currentTags.filter( ( t ) => t !== tag ) );
			recordTracksEvent(
				`${ READER_ONBOARDING_TRACKS_EVENT_PREFIX }interests_modal_tag_unfollowed`,
				{
					tag,
					total_followed: followedTags.length - 1,
				}
			);
		}
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

	return (
		isOpen && (
			<Modal onRequestClose={ onClose } size="fill" className="interests-modal">
				<VStack spacing={ 8 } className="interests-modal__content">
					<VStack spacing={ 0 }>
						<h2 className="interests-modal__title">{ __( 'What topics interest you?' ) }</h2>
						<p className="interests-modal__subtitle">
							{ __(
								'​​Stay up-to-date with your favorite blogs and discover new voices—all from one place.'
							) }
						</p>
						<p className="interests-modal__subtitle">
							{ fixMe( {
								text: 'Follow at least 3 topics to personalize your feed.',
								newCopy: __( 'Follow at least 3 topics to personalize your feed.' ),
								oldCopy: __( 'Follow at least 3 topics to personalize your Reader feed.' ),
							} ) }
						</p>
					</VStack>
					{ categories.map( ( category ) => (
						<div key={ category.name }>
							<h3 className="interests-modal__section-header">{ category.name }</h3>
							<div className="interests-modal__topics-list">
								{ category.topics.map( ( topic ) => (
									<SelectCardCheckboxV2
										key={ topic.name }
										onChange={ ( checked ) => handleTopicChange( checked, topic.tag ) }
										isBusy={ processingTags.has( topic.tag ) }
										checked={
											Array.isArray( topic.tag )
												? topic.tag.every( ( t ) => followedTags.includes( t ) )
												: followedTags.includes( topic.tag )
										}
									>
										{ topic.name }
									</SelectCardCheckboxV2>
								) ) }
							</div>
						</div>
					) ) }
					<div className="reader-onboarding-modal__footer">
						<HStack justify="right" className="reader-onboarding-modal__footer-actions">
							<Button __next40pxDefaultSize variant="tertiary" onClick={ onClose }>
								{ __( 'Cancel' ) }
							</Button>
							<Button
								__next40pxDefaultSize
								onClick={ handleContinue }
								variant="primary"
								disabled={ isContinueDisabled }
								accessibleWhenDisabled
							>
								{ __( 'Continue' ) }
							</Button>
						</HStack>
					</div>
				</VStack>
			</Modal>
		)
	);
};

export default InterestsModal;
