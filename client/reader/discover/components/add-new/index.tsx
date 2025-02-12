import { useDispatch } from '@wordpress/data';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import { AddSitesForm } from 'calypso/landing/subscriptions/components/add-sites-form';
import {
	SubscriptionManagerContextProvider,
	SubscriptionsPortal,
} from 'calypso/landing/subscriptions/components/subscription-manager-context';
import Stream from 'calypso/reader/stream';
import { successNotice } from 'calypso/state/notices/actions';
import './style.scss';

const DiscoverAddNew = () => {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const [ previewFeedId, setPreviewFeedId ] = useState< number | null >( null );
	const [ isLoadingPreview, setIsLoadingPreview ] = useState( false );
	const [ previewError, setPreviewError ] = useState< string | null >( null );

	const handleAddFinished = () => {
		dispatch(
			successNotice( translate( 'Successfully added to your reading list!' ), {
				duration: 5000,
			} )
		);
	};

	const handlePreviewFeed = ( feedId: number | null, error?: string ) => {
		setPreviewFeedId( feedId );
		setPreviewError( error || null );
	};

	const handleLoadingPreview = ( isLoading: boolean ) => {
		setIsLoadingPreview( isLoading );
		if ( isLoading ) {
			setPreviewError( null );
		}
	};

	const renderPreviewContent = () => {
		if ( isLoadingPreview ) {
			return (
				<div className="discover-add-new__preview-placeholder is-loading">
					{ translate( 'Loading feed preview' ) }
				</div>
			);
		}

		if ( previewFeedId ) {
			return (
				<Stream
					className="is-site-stream"
					streamKey={ `feed:${ previewFeedId }` }
					useCompactCards
					showFollowButton={ false }
					suppressSiteNameLink
				/>
			);
		}

		return (
			<div className="discover-add-new__preview-placeholder">
				{ previewError ? (
					<span className="discover-add-new__preview-error-details">
						{ translate(
							'The URL you entered does not contain a valid feed. Please check the URL and try again.'
						) }
					</span>
				) : (
					translate( 'Enter a URL above to preview the feed' )
				) }
			</div>
		);
	};

	return (
		<div className="discover-add-new">
			<div className="discover-add-new__form-container">
				<h2 className="discover-add-new__title">
					{ translate( 'Add new sites, newsletters, and RSS feeds to your reading list.' ) }
				</h2>
				<SubscriptionManagerContextProvider portal={ SubscriptionsPortal.Reader }>
					<AddSitesForm
						onAddFinished={ handleAddFinished }
						onPreviewFeed={ handlePreviewFeed }
						onLoadingPreview={ handleLoadingPreview }
					/>
					<div className="discover-add-new__preview">
						<h2 className="discover-add-new__preview-title">{ translate( 'Feed Preview' ) }</h2>
						<div className="discover-add-new__preview-stream">{ renderPreviewContent() }</div>
					</div>
				</SubscriptionManagerContextProvider>
			</div>
		</div>
	);
};

export default DiscoverAddNew;
