import { Badge } from '@automattic/components';
import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { preventWidows } from 'calypso/lib/formatting';
import emptySearchAI from 'calypso/my-sites/themes/search-results-modern/empty-search-ai.png';
import emptySearchDIFM from 'calypso/my-sites/themes/search-results-modern/empty-search-difm.png';
import emptySearchUpload from 'calypso/my-sites/themes/search-results-modern/empty-search-upload.png';

import './style.scss';

interface SearchMoreOptionsProps {
	title: string;
	subtitle?: string;
	searchTerm?: string;
}

const SearchMoreOptions = ( { title, subtitle, searchTerm }: SearchMoreOptionsProps ) => {
	const translate = useTranslate();

	const trackAIClick = useCallback( () => {
		recordTracksEvent( 'calypso_themeshowcase_more_options_ai_click', {
			search_term: searchTerm,
		} );
	}, [ searchTerm ] );

	const trackDIFMClick = useCallback( () => {
		recordTracksEvent( 'calypso_themeshowcase_more_options_difm_click', {
			search_term: searchTerm,
		} );
	}, [ searchTerm ] );

	const trackUploadClick = useCallback( () => {
		recordTracksEvent( 'calypso_themeshowcase_more_options_upload_theme_click', {
			search_term: searchTerm,
		} );
	}, [ searchTerm ] );

	return (
		<div className="search-more-options">
			<div className="search-more-options__header">
				<h2 className="search-more-options__title">{ title }</h2>
				{ subtitle && (
					<p className="search-more-options__subtitle">{ preventWidows( subtitle ) }</p>
				) }
			</div>
			<div className="search-more-options__cards">
				<div className="search-more-options__card">
					<img className="search-more-options__illustration" src={ emptySearchAI } alt="" />
					<Badge type="info" className="search-more-options__card-label">
						{ translate( 'AI website builder' ) }
					</Badge>
					<p className="search-more-options__card-text">
						{ preventWidows( translate( 'Create a WordPress.com website by chatting with AI.' ) ) }
					</p>
					<Button
						className="search-more-options__button"
						variant="secondary"
						href="/setup/ai-site-builder"
						onClick={ trackAIClick }
					>
						{ translate( 'Build with AI' ) }
					</Button>
				</div>
				<div className="search-more-options__card">
					<img className="search-more-options__illustration" src={ emptySearchDIFM } alt="" />
					<Badge type="info" className="search-more-options__card-label">
						{ translate( 'Let us do it for you' ) }
					</Badge>
					<p className="search-more-options__card-text">
						{ preventWidows(
							translate( 'Get a professional website in days\u2014built by WordPress.com experts.' )
						) }
					</p>
					<Button
						className="search-more-options__button"
						variant="secondary"
						href="https://wordpress.com/website-design-service/?ref=no-themes"
						onClick={ trackDIFMClick }
					>
						{ translate( 'Hire an expert' ) }
					</Button>
				</div>
				<div className="search-more-options__card">
					<img className="search-more-options__illustration" src={ emptySearchUpload } alt="" />
					<Badge type="info" className="search-more-options__card-label">
						{ translate( 'Upload theme' ) }
					</Badge>
					<p className="search-more-options__card-text">
						{ preventWidows(
							translate(
								'Already have a WordPress theme? Upload it here and start customizing right away.'
							)
						) }
					</p>
					<Button
						className="search-more-options__button"
						variant="secondary"
						href="/start/business"
						onClick={ trackUploadClick }
					>
						{ translate( 'Upload theme' ) }
					</Button>
				</div>
			</div>
		</div>
	);
};

export default SearchMoreOptions;
