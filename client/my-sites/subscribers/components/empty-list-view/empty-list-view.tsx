import { recordTracksEvent } from '@automattic/calypso-analytics';
import { localizeUrl } from '@automattic/i18n-utils';
import { Card, CardBody, Icon } from '@wordpress/components';
import { chartBar, chevronRight, people, trendingUp } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import getIsSiteWPCOM from 'calypso/state/selectors/is-site-wpcom';
import { getSelectedSite } from 'calypso/state/ui/selectors';

import './style.scss';

type EmptyListCTALinkProps = {
	icon: JSX.Element;
	text: string;
	url: string;
	eventName: string;
};

const EmptyListCTALink = ( { icon, text, url, eventName }: EmptyListCTALinkProps ) => {
	const handleClick = () => {
		recordTracksEvent( eventName );
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

	const subscribeBlockUrl = ! isWPCOMSite
		? 'https://jetpack.com/support/jetpack-blocks/subscription-form-block/'
		: 'https://wordpress.com/support/wordpress-editor/blocks/subscribe-block/';

	const importSubscribersUrl = ! isWPCOMSite
		? 'https://jetpack.com/support/newsletter/import-subscribers/'
		: 'https://wordpress.com/support/launch-a-newsletter/import-subscribers-to-a-newsletter/';

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
				text={ translate( 'Turn your visitors into subscribers' ) }
				url={ localizeUrl( subscribeBlockUrl ) }
				eventName="calypso_subscribers_empty_view_subscribe_block_clicked"
			/>
			<EmptyListCTALink
				icon={ people }
				text={ translate( 'Import existing subscribers' ) }
				url={ localizeUrl( importSubscribersUrl ) }
				eventName="calypso_subscribers_empty_view_import_subscribers_clicked"
			/>
			{ isWPCOMSite && (
				<EmptyListCTALink
					icon={ trendingUp }
					text={ translate( 'Grow your audience' ) }
					url={ localizeUrl( 'https://wordpress.com/support/category/grow-your-audience/' ) }
					eventName="calypso_subscribers_empty_view_grow_your_audience_clicked"
				/>
			) }
		</div>
	);
};

export default EmptyListView;
