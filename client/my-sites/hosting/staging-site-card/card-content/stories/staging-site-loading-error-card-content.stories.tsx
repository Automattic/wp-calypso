import { Story, Meta } from '@storybook/react';
import { ComponentProps } from 'react';
import { documentHeadStoreMock, ReduxDecorator } from 'calypso/__mocks__/storybook/redux';
import { CardContentWrapper } from 'calypso/my-sites/hosting/staging-site-card/card-content/card-content-wrapper';
import { StagingSiteLoadingErrorCardContent } from 'calypso/my-sites/hosting/staging-site-card/card-content/staging-site-loading-error-card-content';

/**
 * Ideally, this component should depend only on local `./style.scss`. However, currently, some card styles are defined
 * in hosting page CSS file, so we need to include it here.
 */
import '../../../style.scss';

export default {
	title: 'client/components/StagingSite',
	component: StagingSiteLoadingErrorCardContent,
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

type StagingSiteLoadingErrorCardContentStory = Story<
	ComponentProps< typeof StagingSiteLoadingErrorCardContent >
>;
const Template: StagingSiteLoadingErrorCardContentStory = ( args ) => {
	return <StagingSiteLoadingErrorCardContent { ...args } />;
};

const defaultArgs = {
	message: 'Something went wrong',
};

export const StagingSiteLoadingErrorCard = Template.bind( {} );
StagingSiteLoadingErrorCard.args = {
	...defaultArgs,
};
