import { action } from '@storybook/addon-actions';
import { Story, Meta } from '@storybook/react';
import { ComponentProps } from 'react';
import { documentHeadStoreMock, ReduxDecorator } from 'calypso/__mocks__/storybook/redux';
import { CardContentWrapper } from 'calypso/my-sites/hosting/staging-site-card/card-content/card-content-wrapper';
import { NewStagingSiteCardContent } from './card-content/new-staging-site-card-content';

/**
 * Ideally, this component should depend only on local `./style.scss`. However, currently, some card styles are defined
 * in hosting page CSS file, so we need to include it here.
 */
import '../style.scss';

export default {
	title: 'client/components/StagingSite',
	component: NewStagingSiteCardContent,
	decorators: [
		( Story ) => {
			return (
				<ReduxDecorator store={ { ...documentHeadStoreMock } }>
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

type NewStagingSiteCardContentStory = Story< ComponentProps< typeof NewStagingSiteCardContent > >;
const Template: NewStagingSiteCardContentStory = ( args ) => {
	return <NewStagingSiteCardContent { ...args } />;
};

const defaultArgs = {
	onAddClick: action( 'onClick' ),
	isButtonDisabled: false,
	showQuotaError: false,
};

export const NewStagingSiteCard = Template.bind( {} );
NewStagingSiteCard.args = {
	...defaultArgs,
};

export const NewStagingSiteCardWithQuotaError = Template.bind( {} );
NewStagingSiteCardWithQuotaError.args = {
	...defaultArgs,
	isButtonDisabled: true,
	showQuotaError: true,
};
