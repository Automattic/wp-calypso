import { Button, ConfettiAnimation, LoadingPlaceholder } from '@automattic/components';
import { localizeUrl, useLocale } from '@automattic/i18n-utils';
import { useQuery } from '@tanstack/react-query';
import { Modal } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useRef, useState } from 'react';
import wpcom from 'calypso/lib/wp';
import { useSelector } from 'calypso/state';
import { getReaderFollowedTags } from 'calypso/state/reader/tags/selectors';
import SiteRecommendations from './site-recs';
import TagButton from './tag-button';

import './style.scss';

const MINIMUM_TAG_THRESHOLD = 3;

function ReaderOnboardingModal( { setIsOpen, followedTags } ) {
	const translate = useTranslate();
	const locale = useLocale();
	const [ currentPage, setCurrentPage ] = useState( 0 );
	const modalFrameRef = useRef();

	// TODO extract this to a reusable hook as we do the same thing in discover-stream.js
	// maybe move this to HOC to start fetch earlier...
	const { data: interestTags = [] } = useQuery( {
		queryKey: [ 'read/interests', locale ],
		queryFn: () =>
			wpcom.req.get(
				{
					path: `/read/interests`,
					apiNamespace: 'wpcom/v2',
				},
				{
					_locale: locale,
				}
			),
		select: ( data ) => {
			return data.interests;
		},
	} );

	// Reset scroll position on page change.
	useEffect( () => {
		const scrollWindow = modalFrameRef.current?.querySelector(
			'.reader-onboarding-modal .components-modal__content.has-scrolled-content'
		);
		if ( scrollWindow && scrollWindow.scrollTop !== 0 ) {
			scrollWindow.scrollTop = 0;
		}
	}, [ currentPage ] );

	const pages = [
		<>
			<h2 className="reader-onboarding-modal__sub-heading">
				{ translate( 'What are you interested in reading about?' ) }
			</h2>
			<p className="reader-onboarding-modal__step-description">
				{ translate(
					'Please select some tags to follow. We recommend following at least 3 tags, but there is no limit! This will:'
				) }
			</p>
			<ul>
				<li>
					{ translate(
						'Populate the "Tags" section of your navigation bar with streams of these topics.'
					) }
				</li>
				<li>
					{ translate( 'Populate your "Discover" section with content related to these tags.' ) }
				</li>
				<li>{ translate( 'Allow us to recommend blogs you may be interested in.' ) }</li>
			</ul>
			<p>{ translate( 'Below are some popular tags you may be interested in:' ) }</p>
			<div className="reader-onboarding-modal__follow-list">
				{ interestTags.map( ( tag ) => (
					<TagButton title={ tag.title } slug={ tag.slug } key={ tag.slug } />
				) ) }
				{ interestTags.length === 0 && <LoadingPlaceholder /> }
			</div>
		</>,
		<>
			<h2 className="reader-onboarding-modal__sub-heading">
				{ translate( 'Great Job! Now lets look at subscriptions.' ) }
			</h2>
			<p className="reader-onboarding-modal__step-description">
				{ translate(
					'Based on the tags you selected, here are some sites that you may be interested in. Subscribing to a site will:'
				) }
			</p>
			<ul>
				<li>{ translate( 'Populate your "Recent" feed with new posts from these blogs.' ) }</li>
				<li>{ translate( 'Increase the relevance of your future content suggestions.' ) }</li>
				<li>
					{ translate(
						'Add it to your "Manage subscriptions" section, where you can customize settings such as email and notifications.'
					) }
				</li>
			</ul>
			<SiteRecommendations />
		</>,
		<>
			<h2 className="reader-onboarding-modal__sub-heading">{ translate( 'Congratulations!' ) }</h2>
			<p className="reader-onboarding-modal__step-description">
				{ translate(
					'You have followed some tags and subscribed to some blogs. ' +
						'You can continue to add more as you explore the reader and find content that interests you. ' +
						'Here are some links to where you can learn more about the reader:'
				) }
			</p>
			<ul>
				<li>
					<a
						href={ localizeUrl( 'https://wordpress.com/support/reader/' ) }
						target="_blank"
						rel="noreferrer"
					>
						{ translate( 'About the reader' ) }
					</a>
				</li>
				<li>
					<a
						href={ localizeUrl( 'https://wordpress.com/support/reader/reader-lists/' ) }
						target="_blank"
						rel="noreferrer"
					>
						{ translate( 'Lists' ) }
					</a>
				</li>
				<li>
					<a
						href={ localizeUrl( 'https://wordpress.com/support/reader/topics/' ) }
						target="_blank"
						rel="noreferrer"
					>
						{ translate( 'Topics' ) }
					</a>
				</li>
				<li>
					<a
						href={ localizeUrl( 'https://wordpress.com/support/subscribe-to-blogs/' ) }
						target="_blank"
						rel="noreferrer"
					>
						{ translate( 'Blogs' ) }
					</a>
				</li>
				<li>
					<a
						href={ localizeUrl(
							'https://wordpress.com/support/reader/algorithms-search-and-recommendations/'
						) }
						target="_blank"
						rel="noreferrer"
					>
						{ translate( 'Search and recommendations' ) }
					</a>
				</li>
				<li>
					<a
						href={ localizeUrl( 'https://wordpress.com/support/reblogs/' ) }
						target="_blank"
						rel="noreferrer"
					>
						{ translate( 'Reblogs' ) }
					</a>
				</li>
				<li>
					<a
						href={ localizeUrl( 'https://wordpress.com/support/likes/' ) }
						target="_blank"
						rel="noreferrer"
					>
						{ translate( 'Likes' ) }
					</a>
				</li>
				<li>
					<a
						href={ localizeUrl( 'https://wordpress.com/support/notifications/' ) }
						target="_blank"
						rel="noreferrer"
					>
						{ translate( 'Notifications' ) }
					</a>
				</li>
			</ul>
			<ConfettiAnimation />
		</>,
	];

	const onContinue = () => {
		if ( currentPage < pages.length - 1 ) {
			return setCurrentPage( currentPage + 1 );
		}
		// We should also set a calypso preference to check, to prevent this from being shown again
		// after completion.
		return setIsOpen( false );
	};

	const shouldDisableButton = currentPage === 0 && followedTags.length < MINIMUM_TAG_THRESHOLD;

	return (
		<Modal
			title={ translate( 'Welcome to the Reader!' ) }
			className="reader-onboarding-modal"
			// onRequestClose={ () => setIsOpen( false ) }
			isDismissible={ false }
			size="fill"
			ref={ modalFrameRef }
		>
			{ pages[ currentPage ] }
			<div className="reader-onboarding-modal__footer">
				<Button onClick={ onContinue } primary disabled={ shouldDisableButton }>
					{ currentPage < pages.length - 1 ? translate( 'Continue' ) : translate( 'Close window' ) }
				</Button>
			</div>
		</Modal>
	);
}

export default function ReaderOnboardingModalOuter() {
	const followedTags = useSelector( getReaderFollowedTags );
	const [ isOpen, setIsOpen ] = useState( false );

	const shouldShowOnboardingModal =
		Array.isArray( followedTags ) && followedTags.length < MINIMUM_TAG_THRESHOLD;

	useEffect( () => {
		if ( shouldShowOnboardingModal ) {
			setIsOpen( true );
		}
	}, [ shouldShowOnboardingModal ] );

	if ( ! isOpen ) {
		return null;
	}

	return <ReaderOnboardingModal setIsOpen={ setIsOpen } followedTags={ followedTags || [] } />;
}
