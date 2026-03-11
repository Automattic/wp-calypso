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

interface EmptySearchCTAProps {
	title: string;
	subtitle?: string;
}

const EmptySearchCTA = ( { title, subtitle }: EmptySearchCTAProps ) => {
	const translate = useTranslate();

	const trackClick = useCallback( ( cta: string ) => {
		recordTracksEvent( 'calypso_themeshowcase_empty_search_cta_click', { cta } );
	}, [] );

	const trackAIBuilderClick = useCallback( () => {
		trackClick( 'ai_builder' );
	}, [ trackClick ] );

	const trackDIFMClick = useCallback( () => {
		trackClick( 'difm' );
	}, [ trackClick ] );

	const trackUploadThemeClick = useCallback( () => {
		trackClick( 'upload_theme' );
	}, [ trackClick ] );

	return (
		<div className="empty-search-cta">
			<div className="empty-search-cta__header">
				<h2 className="empty-search-cta__title">{ title }</h2>
				{ subtitle && <p className="empty-search-cta__subtitle">{ preventWidows( subtitle ) }</p> }
			</div>
			<div className="empty-search-cta__cards">
				<div className="empty-search-cta__card">
					<img className="empty-search-cta__illustration" src={ emptySearchAI } alt="" />
					<Badge type="info" className="empty-search-cta__card-label">
						{ translate( 'AI website builder' ) }
					</Badge>
					<p className="empty-search-cta__card-text">
						{ preventWidows( translate( 'Create a WordPress.com website by chatting with AI.' ) ) }
					</p>
					<Button
						className="empty-search-cta__button"
						variant="secondary"
						href="/setup/ai-site-builder"
						onClick={ trackAIBuilderClick }
					>
						{ translate( 'Build with AI' ) }
					</Button>
				</div>
				<div className="empty-search-cta__card">
					<img className="empty-search-cta__illustration" src={ emptySearchDIFM } alt="" />
					<Badge type="info" className="empty-search-cta__card-label">
						{ translate( 'Let us do it for you' ) }
					</Badge>
					<p className="empty-search-cta__card-text">
						{ preventWidows(
							translate( 'Get a professional website in days—built by WordPress.com experts.' )
						) }
					</p>
					<Button
						className="empty-search-cta__button"
						variant="secondary"
						href="https://wordpress.com/website-design-service/"
						onClick={ trackDIFMClick }
					>
						{ translate( 'Hire an expert' ) }
					</Button>
				</div>
				<div className="empty-search-cta__card">
					<img className="empty-search-cta__illustration" src={ emptySearchUpload } alt="" />
					<Badge type="info" className="empty-search-cta__card-label">
						{ translate( 'Upload theme' ) }
					</Badge>
					<p className="empty-search-cta__card-text">
						{ preventWidows(
							translate(
								'Already have a WordPress theme? Upload it here and start customizing right away.'
							)
						) }
					</p>
					<Button
						className="empty-search-cta__button"
						variant="secondary"
						href="/themes/upload"
						onClick={ trackUploadThemeClick }
					>
						{ translate( 'Upload theme' ) }
					</Button>
				</div>
			</div>
		</div>
	);
};

export default EmptySearchCTA;
