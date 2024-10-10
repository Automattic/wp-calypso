import { SelectCardCheckbox } from '@automattic/onboarding';
import { Modal, Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
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

	const isButtonDisabled = interests.length < 3;

	const handleInterestChange = ( tag: string | string[] ) => {
		const tags = Array.isArray( tag ) ? tag : [ tag ];
		tags.forEach( ( t ) => {
			if ( interests.includes( t ) ) {
				dispatch( requestUnfollowTag( t ) );
				setInterests( ( prevInterests ) => prevInterests.filter( ( interest ) => interest !== t ) );
			} else {
				dispatch( requestFollowTag( t ) );
				setInterests( ( prevInterests ) => [ ...prevInterests, t ] );
			}
		} );
	};

	const handleContinue = () => {
		if ( ! isButtonDisabled ) {
			onClose();
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
				{ name: __( 'Film & Television' ), tag: 'movies-and-tv' },
				{ name: __( 'Book Reviews' ), tag: 'books' },
				{ name: __( 'Art & Photography' ), tag: [ 'art', 'photography' ] },
				{ name: __( 'Theatre & Performance' ), tag: 'theatre' },
				{ name: __( 'Creative Writing' ), tag: 'writing' },
				{ name: __( 'Architecture' ), tag: 'architecture' },
				{ name: __( 'Comics' ), tag: 'comics' },
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
			<Button onClick={ handleContinue } variant="primary" disabled={ isButtonDisabled }>
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
			</Modal>
		)
	);
};

export default InterestsModal;
