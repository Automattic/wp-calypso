import { Story, Meta } from '@storybook/react';
import { translate, TranslateOptionsText } from 'i18n-calypso';
import { ComponentProps } from 'react';
import { documentHeadStoreMock, ReduxDecorator } from 'calypso/__mocks__/storybook/redux';
import { CardContentWrapper } from '../card-content-wrapper';
import { StagingSiteLoadingErrorCardContent } from '../staging-site-loading-error-card-content';

/**
 * Ideally, this component should depend only on local `./style.scss`. However, currently, some card styles are defined
 * in hosting page CSS file, so we need to include it here.
 */
import '../../../style.scss';

export default {
	title: 'client/my-sites/hosting/StagingSiteCard',
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
	message: translate(
		'Unable to access the staging site {{a}}%(stagingSiteName)s{{/a}}. Please contact the site owner.',
		{
			args: {
				stagingSiteName: 'Test Site',
			},
			components: {
				a: <a href="http://example.com/" />,
			},
			textOnly: true,
		} as TranslateOptionsText
	) as string,
	testId: 'staging-sites-access-message',
};

export const StagingSiteLoadingError = Template.bind( {} );
StagingSiteLoadingError.args = {
	...defaultArgs,
};
