import { Card, Gridicon } from '@automattic/components';
import { action } from '@storybook/addon-actions';
import { Story, Meta } from '@storybook/react';
import { useTranslate } from 'i18n-calypso';
import { ComponentProps } from 'react';
import { documentHeadStoreMock, ReduxDecorator } from 'calypso/__mocks__/storybook/redux';
import CardHeading from 'calypso/components/card-heading';
import { NewStagingSiteCardContent } from './card-content/new-staging-site-card-content';

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
			const translate = useTranslate();
			return (
				<Card className="staging-site-card">
					{
						// eslint-disable-next-line wpcalypso/jsx-gridicon-size
						<Gridicon icon="science" size={ 32 } />
					}
					<CardHeading id="staging-site">{ translate( 'Staging site' ) }</CardHeading>
					<Story></Story>
				</Card>
			);
		},
	],
} as Meta;

type NewStagingSiteCardContentStory = Story< ComponentProps< typeof NewStagingSiteCardContent > >;
const Template: NewStagingSiteCardContentStory = ( args ) => {
	return <NewStagingSiteCardContent { ...args } />;
};

const defaultArgs = {
	disabled: false,
	addingStagingSite: false,
	isLoadingQuotaValidation: false,
	hasValidQuota: true,
	onAddClick: action( 'onClick' ),
};

export const NewStagingSiteCard = Template.bind( {} );
NewStagingSiteCard.args = {
	...defaultArgs,
};
