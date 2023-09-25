import { Card, Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import DocumentHead from 'calypso/components/data/document-head';
import FormattedHeader from 'calypso/components/formatted-header';
import Main from 'calypso/components/main';
import './style.scss';

type Props = {
	siteSlug: string;
};

export const MailPoetConfirmationPage: React.FC< Props > = ( { siteSlug } ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const [ isBusy, setIsBusy ] = useState( false );

	const getItNowLink = 'https://wordpress.com/pricing/';

	const getItNowClickHandler = () => {
		setIsBusy( true );
		// TODO: implement get it now handlergst
		dispatch( { type: 'GET_IT_NOW', payload: siteSlug } );
		// console.log( 'getItNowClickHandler' );
	};

	const dismissHandler = () => {
		// TODO: implement dismiss handler
		// console.log( 'Dismissed' );
	};

	return (
		<Main wideLayout className="mailpoet-confirmation__main mailpoet-confirmation__no-header">
			<DocumentHead title={ translate( 'MailPoet Subscription' ) } />
			<FormattedHeader
				brandFont
				headerText={ translate( 'MailPoet Subscription' ) }
				subHeaderText={ translate( 'Get a Free MailPoet Subscription' ) }
				align="left"
			/>
			<Card>
				{ /* <TrackComponentView eventName="calypso_profile_domain_upsell_impression" /> */ }
				<div>
					<p>
						{ translate(
							'The eCommerce plan subscription provides a complimentary MailPoet Business Subscription, allowing you to send visually appealing emails that consistently land in inboxes and clutivate a loyal subscriber base.'
						) }
					</p>
					<p>
						{ translate( 'Know more about {{a/}}', {
							components: {
								a: (
									<a href="https://kb.mailpoet.com/article/183-mailpoets-sending-service">
										MailPoet Service
									</a>
								),
							},
						} ) }
					</p>

					<div className="mailpoet-confirmation-actions">
						<Button primary href={ getItNowLink } onClick={ getItNowClickHandler }>
							{ translate( 'Get it Now' ) }
						</Button>
						<Button onClick={ dismissHandler } busy={ isBusy }>
							{ translate( 'No I´m ok' ) }
						</Button>
					</div>
				</div>
			</Card>
		</Main>
	);
};
