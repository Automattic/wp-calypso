import { Story, Meta } from '@storybook/react';
import { ComponentProps } from 'react';
import { documentHeadStoreMock, ReduxDecorator } from 'calypso/__mocks__/storybook/redux';
import { CardContentWrapper } from '../card-content-wrapper';
import { StagingSiteLoadingBarCardContent } from '../staging-site-loading-bar-card-content';

/**
 * Ideally, this component should depend only on local `./style.scss`. However, currently, some card styles are defined
 * in hosting page CSS file, so we need to include it here.
 */
import '../../../style.scss';

export default {
	title: 'client/my-sites/hosting/StagingSiteCard',
	component: StagingSiteLoadingBarCardContent,
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

type StagingSiteLoadingBarCardContentStory = Story<
	ComponentProps< typeof StagingSiteLoadingBarCardContent >
>;
const Template: StagingSiteLoadingBarCardContentStory = ( args ) => {
	return <StagingSiteLoadingBarCardContent { ...args } />;
};

const defaultArgs = {
	isReverting: false,
	progress: 10,
	isOwner: false,
};

export const StagingSiteLoadingBar = Template.bind( {} );
StagingSiteLoadingBar.args = {
	...defaultArgs,
};

export const StagingSiteLoadingBarForOwner = Template.bind( {} );
StagingSiteLoadingBarForOwner.args = {
	...defaultArgs,
	isOwner: true,
};

export const StagingSiteLoadingBarDeleting = Template.bind( {} );
StagingSiteLoadingBarDeleting.args = {
	...defaultArgs,
	isReverting: true,
};
