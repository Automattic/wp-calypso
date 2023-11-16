import { Card, Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import DocumentHead from 'calypso/components/data/document-head';
import Main from 'calypso/components/main';
import NavigationHeader from 'calypso/components/navigation-header';
import { addMailPoetUpgrade } from 'calypso/data/marketplace/mailpoet-add-upgrade';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import './style.scss';

export const MailPoetUpgradePage = ( { siteId }: { siteId: number } ) => {
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
						'MailPoet Business is added to your site. MailPoet plugin will be installed and activated shortly.'
					)
				)
			);
		} catch ( error ) {
			dispatch( errorNotice( ( error as Error ).message ) );
		} finally {
			setIsBusy( false );
			// Either error or success. We will mark it as completed so user can navigate back
			setIsCompleted( true );
		}
	};

	const dismissHandler = () => {
		window.history.back();
	};

	return (
		<Main wideLayout className="mailpoet-upgrade mailpoet-upgrade-header">
			<DocumentHead title={ translate( 'MailPoet Business' ) } />
			<NavigationHeader
				title={ translate( 'MailPoet Business' ) }
				subtitle={ translate( 'Get a complimentary MailPoet Business Subscription' ) }
			/>
			<Card>
				<p>
					{ translate(
						'Your Commerce plan provides a complimentary MailPoet Business subscription, allowing you to send visually appealing emails that consistently land in inboxes and cultivate a loyal subscriber base.'
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
				<div className="mailpoet-upgrade-actions">
					{ isCompleted ? (
						<Button primary onClick={ dismissHandler } busy={ isBusy }>
							{ translate( 'Go Back' ) }
						</Button>
					) : (
						<>
							<Button primary onClick={ getItNowClickHandler } busy={ isBusy }>
								{ translate( 'Get it now' ) }
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
