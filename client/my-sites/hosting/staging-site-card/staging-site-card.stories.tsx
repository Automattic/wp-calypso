import { Card, Gridicon } from '@automattic/components';
import { action } from '@storybook/addon-actions';
import { Story, Meta } from '@storybook/react';
import { useTranslate } from 'i18n-calypso';
import { ComponentProps } from 'react';
import { documentHeadStoreMock, ReduxDecorator } from 'calypso/__mocks__/storybook/redux';
import CardHeading from 'calypso/components/card-heading';
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
