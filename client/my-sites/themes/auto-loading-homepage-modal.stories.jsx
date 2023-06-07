import { action } from '@storybook/addon-actions';
import { ReduxDecorator } from 'calypso/__mocks__/storybook/redux';
import { AutoLoadingHomepageModal } from './auto-loading-homepage-modal';

export default {
	title: 'client/my-sites/themes/AutoLoadingHomepageModal',
	component: AutoLoadingHomepageModal,
	decorators: [
		( Story ) => {
			return (
				<ReduxDecorator store={ { bumpStat: () => {}, recordTracksEvent: () => {} } }>
					<Story></Story>
				</ReduxDecorator>
			);
		},
	],
};

const Template = ( args ) => <AutoLoadingHomepageModal { ...args } />;

export const isVisible = Template.bind( {} );
isVisible.args = {
	hasActivated: false,
	hasAutoLoadingHomepage: true,
	hideAutoLoadingHomepageWarning: action( 'hideAutoLoadingHomepageWarning' ),
	isActivating: false,
	isVisible: true,
	source: 'details',
	theme: {
		author: 'author',
		author_uri: 'author_uri',
		id: 'id',
		name: 'name',
	},
};
