import { Button } from '@automattic/components';
import { useLocale } from '@automattic/i18n-utils';
import { useQuery } from '@tanstack/react-query';
import { Modal } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import wpcom from 'calypso/lib/wp';
import { useSelector } from 'calypso/state';
import { getReaderFollowedTags } from 'calypso/state/reader/tags/selectors';
import SiteRecommendations from './site-recs';
import TagButton from './tag-button';

import './style.scss';

// 9 for testing purposes, we will probably do 3 to start.
const MINIMUM_TAG_THRESHOLD = 900;

function ReaderOnboardingModal( { setIsOpen } ) {
	const translate = useTranslate();
	const locale = useLocale();
	const [ currentPage, setCurrentPage ] = useState( 0 );

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
						'List them in your "Manage subscriptions" section, where you can customize settings such as email and notifications.'
					) }
				</li>
			</ul>
			<SiteRecommendations />
		</>,
	];

	return (
		<Modal
			title={ translate( 'Welcome to the Reader!' ) }
			className="reader-onboarding-modal"
			bodyOpenClassName="reader-onboarding-modal__body"
			onRequestClose={ () => setIsOpen( false ) }
			isDismissible={ false }
			size="fill"
		>
			{ pages[ currentPage ] }
			<div className="reader-onboarding-modal__footer">
				<Button onClick={ () => setCurrentPage( currentPage + 1 ) }>{ translate( 'Next' ) }</Button>
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

	return <ReaderOnboardingModal setIsOpen={ setIsOpen } followedTags={ followedTags } />;
}
