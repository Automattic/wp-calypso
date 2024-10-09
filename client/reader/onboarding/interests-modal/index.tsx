import { SelectCardCheckbox } from '@automattic/onboarding';
import { Modal, Button } from '@wordpress/components';
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { requestFollowTag, requestUnfollowTag } from 'calypso/state/reader/tags/items/actions';
import { getReaderFollowedTags } from 'calypso/state/reader/tags/selectors';
import './style.scss';

interface InterestsModalProps {
	isOpen: boolean;
	onClose: () => void;
}

interface Topic {
	name: string;
	tag: string | string[];
}

interface Category {
	name: string;
	topics: Topic[];
}

interface Tag {
	slug: string;
	// Add other properties if needed
}

const InterestsModal: React.FC< InterestsModalProps > = ( { isOpen, onClose } ) => {
	const [ interests, setInterests ] = useState< string[] >( [] );
	const followedTags = useSelector( getReaderFollowedTags );
	const dispatch = useDispatch();

	useEffect( () => {
		if ( followedTags ) {
			const initialInterests = followedTags.map( ( tag: Tag ) => tag.slug );
			setInterests( initialInterests );
		}
	}, [ followedTags ] );

	const handleInterestChange = ( tag: string | string[] ) => {
		const tags = Array.isArray( tag ) ? tag : [ tag ];
		setInterests( ( prevInterests ) => {
			const newInterests = new Set( prevInterests );
			tags.forEach( ( t ) => {
				if ( newInterests.has( t ) ) {
					newInterests.delete( t );
				} else {
					newInterests.add( t );
				}
			} );
			return Array.from( newInterests );
		} );
	};

	const handleContinue = () => {
		// Unfollow tags that are no longer selected
		followedTags?.forEach( ( followedTag ) => {
			if ( ! interests.includes( followedTag.slug ) ) {
				dispatch( requestUnfollowTag( followedTag.slug ) );
			}
		} );

		// Follow newly selected tags
		interests.forEach( ( tag ) => {
			const isAlreadyFollowed = followedTags?.some( ( followedTag ) => followedTag.slug === tag );
			if ( ! isAlreadyFollowed ) {
				dispatch( requestFollowTag( tag ) );
			}
		} );

		onClose();
	};

	const categories: Category[] = [
		{
			name: 'Lifestyle & Personal Development',
			topics: [
				{ name: 'Health', tag: 'health' },
				{ name: 'Personal Finance', tag: 'personal-finance' },
				{ name: 'Food', tag: 'food' },
				{ name: 'Life Hacks', tag: 'life-hacks' },
				{ name: 'Mental Health', tag: 'mental-health' },
				{ name: 'Sleep', tag: 'sleep' },
				{ name: 'Relationships', tag: 'relationships' },
				{ name: 'Parenting', tag: 'parenting' },
				{ name: 'Travel', tag: 'travel' },
			],
		},
		{
			name: 'Technology & Innovation',
			topics: [
				{ name: 'Gadgets', tag: 'gadgets' },
				{ name: 'Software', tag: 'software' },
				{ name: 'Tech News', tag: 'technology' },
				{ name: 'Design', tag: 'design' },
				{ name: 'Artificial Intelligence', tag: 'artificial-intelligence' },
				{ name: 'Cybersecurity', tag: 'cybersecurity' },
				{ name: 'Gaming', tag: 'gaming' },
				{ name: 'Crypto', tag: 'cryptocurrency' },
				{ name: 'Science', tag: 'science' },
			],
		},
		{
			name: 'Creative Arts & Entertainment',
			topics: [
				{ name: 'Music', tag: 'music' },
				{ name: 'Film & Television', tag: 'movies-and-tv' },
				{ name: 'Book Reviews', tag: 'books' },
				{ name: 'Art & Photography', tag: [ 'art', 'photography' ] },
				{ name: 'Theatre & Performance', tag: 'theatre' },
				{ name: 'Creative Writing', tag: 'writing' },
				{ name: 'Architecture', tag: 'architecture' },
				{ name: 'Comics', tag: 'comics' },
				{ name: 'DIY Projects', tag: 'diy' },
			],
		},
		{
			name: 'Society & Culture',
			topics: [
				{ name: 'Education', tag: 'education' },
				{ name: 'Nature', tag: 'nature' },
				{ name: 'Future', tag: 'future' },
				{ name: 'Politics', tag: 'politics' },
				{ name: 'Climate', tag: 'climate-change' },
				{ name: 'History', tag: 'history' },
				{ name: 'Society', tag: 'society' },
				{ name: 'Culture', tag: 'culture' },
				{ name: 'Philosophy', tag: 'philosophy' },
			],
		},
		{
			name: 'Industry',
			topics: [
				{ name: 'Business', tag: 'business' },
				{ name: 'Startups', tag: 'startups' },
				{ name: 'Finance', tag: 'finance' },
				{ name: 'Space', tag: 'space' },
				{ name: 'Leadership', tag: 'leadership' },
				{ name: 'Marketing', tag: 'marketing' },
				{ name: 'Remote Work', tag: 'remote-work' },
				{ name: 'SaaS', tag: 'saas' },
				{ name: 'Creator Economy', tag: 'creator-economy' },
			],
		},
	];

	const headerActions = (
		<>
			<Button onClick={ onClose } variant="link">
				Cancel
			</Button>
			<Button onClick={ handleContinue } variant="primary">
				Continue
			</Button>
		</>
	);

	return (
		isOpen && (
			<Modal
				title="Select Your Interests"
				onRequestClose={ onClose }
				isFullScreen
				headerActions={ headerActions }
				isDismissible={ false }
			>
				<div className="interests-modal__content">
					{ categories.map( ( category ) => (
						<div key={ category.name } className="interests-modal__category">
							<h3 className="interests-modal__section-header">{ category.name }</h3>
							<div className="interests-list">
								{ category.topics.map( ( topic ) => (
									<SelectCardCheckbox
										key={ topic.name }
										onChange={ () => handleInterestChange( topic.tag ) }
										checked={
											Array.isArray( topic.tag )
												? topic.tag.every( ( t ) => interests.includes( t ) )
												: interests.includes( topic.tag )
										}
									>
										{ topic.name }
									</SelectCardCheckbox>
								) ) }
							</div>
						</div>
					) ) }
				</div>
				<button onClick={ onClose }>Close</button>
			</Modal>
		)
	);
};

export default InterestsModal;
