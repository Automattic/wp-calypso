/**
 * JetpackEmptyListView Component
 *
 * This component is specifically designed for the subscribers page
 * when there are no subscribers on a Jetpack site.
 * It's visible in both Jetpack Cloud and WordPress.com.
 * It differs from the original EmptyListView:
 *    - Original: Used in stats page to show subscriber growth and engagement
 *    - Jetpack: Used in subscribers page to add subscribers
 */

import { recordTracksEvent } from '@automattic/calypso-analytics';
import page from '@automattic/calypso-router';
import { localizeUrl } from '@automattic/i18n-utils';
import { Card, CardBody, Icon } from '@wordpress/components';
import { copy, upload, reusableBlock, chevronRight } from '@wordpress/icons';
import { useTranslate, default as i18n } from 'i18n-calypso';
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
		<Card
			className="jetpack-empty-list-view__cta-link"
			size="small"
			as="button"
			onClick={ onClick }
		>
			<CardBody className="jetpack-empty-list-view__card-body">
				<Icon className="jetpack-empty-list-view__cta-link-icon" icon={ icon } size={ 20 } />
				<span className="jetpack-empty-list-view__cta-link-text">{ text }</span>
				<Icon
					className="jetpack-empty-list-view__cta-link-icon"
					icon={ chevronRight }
					size={ 20 }
				/>
			</CardBody>
		</Card>
	);
};

const JetpackEmptyListView = () => {
	const translate = useTranslate();
	const selectedSite = useSelector( getSelectedSite );

	// Record an event when the empty view is rendered
	useEffect( () => {
		recordTracksEvent( 'calypso_subscribers_empty_view_displayed' );
	}, [] );

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
		<div className="jetpack-empty-list-view">
			<h2 className="jetpack-empty-list-view__title">
				{ translate( 'Add subscribers to %s', {
					args: [ selectedSite?.title || '' ],
					comment: "%s is the site's title",
				} ) }
			</h2>
			<p className="jetpack-empty-list-view__description">
				{ i18n.fixMe( {
					text: 'No subscribers yet? {{howToTurnVisitorsLink}}Turn your site visitors into subscribers.{{/howToTurnVisitorsLink}}',
					newCopy: translate(
						'No subscribers yet? {{howToTurnVisitorsLink}}Turn your site visitors into subscribers.{{/howToTurnVisitorsLink}}',
						{
							components: {
								howToTurnVisitorsLink: (
									<a
										href={ localizeUrl(
											'https://jetpack.com/support/jetpack-blocks/subscription-form-block/'
										) }
										target="_blank"
										rel="noopener noreferrer"
										onClick={ () =>
											recordTracksEvent( 'calypso_subscribers_empty_view_subscribe_block_clicked' )
										}
									/>
								),
							},
						}
					),
					oldCopy: '',
				} ) }
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
			<EmptyListCTALink
				icon={ reusableBlock }
				text={ translate( 'Import from Substack' ) }
				onClick={ () => handleMethodSelect( 'substack' ) }
			/>
		</div>
	);
};

export default JetpackEmptyListView;
