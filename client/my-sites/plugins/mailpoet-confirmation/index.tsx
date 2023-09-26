import { Card, Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import DocumentHead from 'calypso/components/data/document-head';
import FormattedHeader from 'calypso/components/formatted-header';
import Main from 'calypso/components/main';
import './style.scss';
import { addMailPoetUpgrade } from 'calypso/data/marketplace/mailpoet-add-upgrade';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';

export const MailPoetConfirmationPage = ( { siteId }: { siteId: number } ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const [ isBusy, setIsBusy ] = useState( false );
	const [ isCompleted, setIsCompleted ] = useState( false );

	const getItNowClickHandler = async () => {
		setIsBusy( true );
		try {
			await addMailPoetUpgrade( siteId );

			dispatch(
				successNotice(
					translate(
						'The MailPoet is added to your site. MailPoet plugin will be installed and activated shortly.'
					)
				)
			);
		} catch ( error ) {
			dispatch( errorNotice( ( error as Error ).message ) );
		} finally {
			setIsBusy( false );
			// Either if error or success. We will mark it as completed so user can navigate back
			setIsCompleted( true );
		}
	};

	const dismissHandler = () => {
		window.history.back();
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
					{ isCompleted ? (
						<Button primary onClick={ dismissHandler } busy={ isBusy }>
							{ translate( 'Go Back' ) }
						</Button>
					) : (
						<>
							<Button primary onClick={ getItNowClickHandler } busy={ isBusy }>
								{ translate( 'Get it Now' ) }
							</Button>
							<Button onClick={ dismissHandler } busy={ isBusy }>
								{ translate( 'No I´m ok' ) }
							</Button>
						</>
					) }
				</div>
			</Card>
		</Main>
	);
};
