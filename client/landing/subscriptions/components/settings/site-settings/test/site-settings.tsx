/**
 * @jest-environment jsdom
 */
import { Reader } from '@automattic/data-stores';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { SiteSettingsPopover } from '../site-settings';

jest.mock( 'i18n-calypso', () => ( {
	...jest.requireActual( 'i18n-calypso' ),
	useTranslate: jest.fn( () => ( text ) => text ),
} ) );

describe( 'Site Settings', () => {
	it( 'Ensure correct href value of the View Feed button within the Site Settings popover', async () => {
		render(
			<SiteSettingsPopover
				notifyMeOfNewPosts={ false }
				onNotifyMeOfNewPostsChange={ () => undefined }
				updatingNotifyMeOfNewPosts={ false }
				emailMeNewPosts={ false }
				onEmailMeNewPostsChange={ () => undefined }
				updatingEmailMeNewPosts={ false }
				deliveryFrequency={ Reader.EmailDeliveryFrequency.Instantly }
				onDeliveryFrequencyChange={ () => undefined }
				updatingFrequency={ false }
				emailMeNewComments={ false }
				onEmailMeNewCommentsChange={ () => undefined }
				updatingEmailMeNewComments={ false }
				onUnsubscribe={ () => undefined }
				unsubscribing={ false }
				isWpComSite={ false }
				feedId={ 123456789 }
			/>
		);

		act( () => {
			userEvent.click( screen.getByRole( 'button', { name: 'More actions' } ) );
		} );

		await waitFor( () => {
			expect( screen.getByRole( 'link', { name: 'View feed' } ) ).toHaveAttribute(
				'href',
				'/read/feeds/123456789'
			);
		} );
	} );
} );
