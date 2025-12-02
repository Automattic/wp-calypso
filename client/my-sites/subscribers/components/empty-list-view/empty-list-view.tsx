import { recordTracksEvent } from '@automattic/calypso-analytics';
import { localizeUrl } from '@automattic/i18n-utils';
import { Card, CardBody, Icon } from '@wordpress/components';
import { chartBar, chevronRight, people, trendingUp } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import useSupportDocData from 'calypso/components/inline-support-link/use-support-doc-data';
import getIsSiteWPCOM from 'calypso/state/selectors/is-site-wpcom';
import { getSelectedSite } from 'calypso/state/ui/selectors';

import './style.scss';

type EmptyListCTALinkProps = {
	icon: JSX.Element;
	text: string;
	url?: string;
	eventName: string;
	openInHelpCenter?: boolean;
	supportContext?: string;
};

const EmptyListCTALink = ( {
	icon,
	text,
	url,
	eventName,
	openInHelpCenter = false,
	supportContext,
}: EmptyListCTALinkProps ) => {
	const { openSupportDoc } = useSupportDocData( {
		supportContext,
	} );

	const handleClick = ( event: React.MouseEvent< HTMLAnchorElement > ) => {
		recordTracksEvent( eventName );

		if ( openInHelpCenter ) {
			event.preventDefault();
			openSupportDoc();
		}
	};

	return (
		<Card
			className="empty-list-view__cta-link"
			size="small"
			as="a"
			href={ url }
			rel="noreferrer"
			target="_blank"
			onClick={ handleClick }
		>
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

	// Record an event when the empty view is rendered
	useEffect( () => {
		recordTracksEvent( 'calypso_subscribers_empty_view_displayed' );
	}, [] );

	const selectedSite = useSelector( getSelectedSite );
	const siteId = selectedSite?.ID || null;
	const isWPCOMSite = useSelector( ( state ) => getIsSiteWPCOM( state, siteId ) );

	const subscribeBlockUrl = isWPCOMSite
		? 'https://wordpress.com/support/wordpress-editor/blocks/subscribe-block/'
		: 'https://jetpack.com/support/jetpack-blocks/subscription-form-block/';
	const subscribeBlockContext = isWPCOMSite ? 'subscribe-block' : 'subscribe-block-jetpack';

	const importSubscribersContext = isWPCOMSite
		? 'import-subscribers'
		: 'import-subscribers-jetpack';
	const importSubscribersUrl = isWPCOMSite
		? 'https://wordpress.com/support/launch-a-newsletter/import-subscribers-to-a-newsletter/'
		: 'https://jetpack.com/support/newsletter/import-subscribers/';

	return (
		<div className="empty-list-view">
			<h2 className="empty-list-view__title">{ translate( 'Grow your subscribers' ) }</h2>
			<p className="empty-list-view__description">
				{ translate(
					'Publishing & sharing content can help bring traffic to your site. Let’s help you get started.'
				) }
			</p>
			<EmptyListCTALink
				icon={ chartBar }
				text={ translate( 'How to turn your visitors into subscribers' ) }
				url={ localizeUrl( subscribeBlockUrl ) }
				supportContext={ subscribeBlockContext }
				eventName="calypso_subscribers_empty_view_subscribe_block_clicked"
				openInHelpCenter={ isWPCOMSite ?? false }
			/>
			<EmptyListCTALink
				icon={ people }
				text={ translate( 'How to import existing subscribers' ) }
				supportContext={ importSubscribersContext }
				url={ localizeUrl( importSubscribersUrl ) }
				eventName="calypso_subscribers_empty_view_import_subscribers_clicked"
				openInHelpCenter={ isWPCOMSite ?? false }
			/>
			{ isWPCOMSite && (
				<EmptyListCTALink
					icon={ trendingUp }
					text={ translate( 'How to grow your audience' ) }
					url={ localizeUrl( 'https://wordpress.com/support/category/grow-your-audience/' ) }
					eventName="calypso_subscribers_empty_view_grow_your_audience_clicked"
				/>
			) }
		</div>
	);
};

export default EmptyListView;
