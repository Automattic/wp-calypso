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

// 9 for testing purposes, we will probably do 3 to start.
const MINIMUM_TAG_THRESHOLD = 9;

function ReaderOnboardingModal( { setIsOpen } ) {
	const translate = useTranslate();
	const locale = useLocale();
	const [ currentPage, setCurrentPage ] = useState( 0 );

	// TODO extract this to a reusable hook as we do the same thing in discover-stream.js
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
			<h2>{ translate( 'What are you interested in reading about?' ) }</h2>
			<p>
				{ translate(
					'Tags represent topics. By selecting some tags to follow, ' +
						'we will be able to show you more content you may be interested in reading about. ' +
						'You can find streams for specific tags you are following in the "Tags" section of the navigation sidebar. ' +
						'The "Discover" section will show popular posts based on the tags you are following. ' +
						'We recommend following at least 3 tags. Please choose a few below:'
				) }
			</p>
			{ interestTags.map( ( tag ) => (
				<TagButton title={ tag.title } slug={ tag.slug } />
			) ) }
		</>,
	];

	return (
		<Modal
			title="Reader onboarding modal"
			className="reader-onboarding-modal"
			onRequestClose={ () => setIsOpen( false ) }
		>
			<h1>{ translate( 'Welcome to the Reader!' ) }</h1>
			<SiteRecommendations />
			{ pages[ currentPage ] };
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
