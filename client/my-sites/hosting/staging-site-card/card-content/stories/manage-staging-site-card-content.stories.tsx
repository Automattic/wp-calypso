import { action } from '@storybook/addon-actions';
import { Story, Meta } from '@storybook/react';
import { ComponentProps } from 'react';
import { documentHeadStoreMock, ReduxDecorator } from 'calypso/__mocks__/storybook/redux';
import { CardContentWrapper } from 'calypso/my-sites/hosting/staging-site-card/card-content/card-content-wrapper';
import { ManageStagingSiteCardContent } from 'calypso/my-sites/hosting/staging-site-card/card-content/manage-staging-site-card-content';

/**
 * Ideally, this component should depend only on local `./style.scss`. However, currently, some card styles are defined
 * in hosting page CSS file, so we need to include it here.
 */
import '../../../style.scss';

export default {
	title: 'client/my-sites/hosting/StagingSiteCard',
	component: ManageStagingSiteCardContent,
	decorators: [
		( Story ) => {
			return (
				<ReduxDecorator
					store={ {
						...documentHeadStoreMock,
						sites: {
							items: { 25: { ID: 25 } },
						},
					} }
				>
					<Story></Story>
				</ReduxDecorator>
			);
		},
		( Story ) => {
			return (
				<CardContentWrapper>
					<Story></Story>
				</CardContentWrapper>
			);
		},
		( Story ) => {
			return (
				<div className="hosting" style={ { padding: '20px', backgroundColor: '#f6f7f7' } }>
					<Story></Story>
				</div>
			);
		},
	],
} as Meta;

type ManageStagingSiteCardContentStory = Story<
	ComponentProps< typeof ManageStagingSiteCardContent >
>;
const Template: ManageStagingSiteCardContentStory = ( args ) => {
	return <ManageStagingSiteCardContent { ...args } />;
};

const defaultArgs = {
	stagingSite: {
		id: 25,
		url: 'http://example.com',
		name: 'Test Staging Site',
		user_has_permission: true,
	},
	onDeleteClick: action( 'onClick' ),
	isButtonDisabled: false,
	isBusy: false,
};

export const ManageStagingSiteCard = Template.bind( {} );
ManageStagingSiteCard.args = {
	...defaultArgs,
};
