import { recordTracksEvent } from '@automattic/calypso-analytics';
import { isEnabled } from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import { Card, CardBody, Icon } from '@wordpress/components';
import { copy, upload, reusableBlock, chevronRight } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import { getSelectedSite } from 'calypso/state/ui/selectors';

import './style.scss';

type EmptyListCTALinkProps = {
	icon: JSX.Element;
	text: string;
	onClick: () => void;
};

const EmptyListCTALink = ( { icon, text, onClick }: EmptyListCTALinkProps ) => {
	return (
		<Card className="empty-list-view__cta-link" size="small" as="a" onClick={ onClick }>
			<CardBody className="empty-list-view__card-body">
				<Icon className="empty-list-view__cta-link-icon" icon={ icon } size={ 20 } />
				<span className="empty-list-view__cta-link-text">{ text }</span>
				<Icon className="empty-list-view__cta-link-icon" icon={ chevronRight } size={ 20 } />
			</CardBody>
		</Card>
	);
};

const EmptyListView = () => {
	const translate = useTranslate();
	const selectedSite = useSelector( getSelectedSite );

	// Record an event when the empty view is rendered
	useEffect( () => {
		recordTracksEvent( 'calypso_subscribers_empty_view_displayed' );
	}, [] );

	const isSubstackSubscriberImporterEnabled = isEnabled( 'importers/newsletter' );

	const handleMethodSelect = ( method: string ) => {
		recordTracksEvent( 'calypso_subscribers_empty_view_add_method_clicked', {
			method,
		} );
		if ( method === 'substack' ) {
			if ( isJetpackCloud() ) {
				window.location.href = `https://wordpress.com/import/newsletter/substack/${
					selectedSite?.slug || selectedSite?.ID || ''
				}`;
			} else {
				page( `/import/newsletter/substack/${ selectedSite?.slug || selectedSite?.ID || '' }` );
			}
			return;
		}
		// Update URL hash with selected method
		window.location.hash = `#add-subscribers?method=${ method }`;
	};

	return (
		<div className="empty-list-view">
			<h2 className="empty-list-view__title">
				{ translate( 'Add subscribers to %s', {
					args: [ selectedSite?.title || '' ],
					comment: "%s is the site's title",
				} ) }
			</h2>
			<p className="empty-list-view__description">
				{ translate(
					'We’ll automatically clean duplicate, incomplete, outdated, or spammy emails to boost open rates and engagement.'
				) }
			</p>
			<EmptyListCTALink
				icon={ copy }
				text={ translate( 'Add subscribers manually' ) }
				onClick={ () => handleMethodSelect( 'manually' ) }
			/>
			<EmptyListCTALink
				icon={ upload }
				text={ translate( 'Use a CSV file' ) }
				onClick={ () => handleMethodSelect( 'upload' ) }
			/>
			{ isSubstackSubscriberImporterEnabled && (
				<EmptyListCTALink
					icon={ reusableBlock }
					text={ translate( 'Import from Substack' ) }
					onClick={ () => handleMethodSelect( 'substack' ) }
				/>
			) }
		</div>
	);
};

export default EmptyListView;
