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

const baseProps = {
	acceptAutoLoadingHomepageWarning: action( 'acceptAutoLoadingHomepageWarning' ),
	activateTheme: action( 'activateTheme' ),
	hasActivated: false,
	hasAutoLoadingHomepage: true,
	hideAutoLoadingHomepageWarning: action( 'hideAutoLoadingHomepageWarning' ),
	isActivating: false,
	isCurrentTheme: false,
	isVisible: true,
	source: 'details',
	theme: {
		author: 'author',
		author_uri: 'author_uri',
		id: 'id',
		name: 'Sample Theme',
	},
};

export const isVisible = Template.bind( {} );
isVisible.args = {
	...baseProps,
};

/**
 * Don't show the modal in the patterns below.
 */

export const isCurrentTheme = Template.bind( {} );
isCurrentTheme.args = {
	...baseProps,
	isCurrentTheme: true,
};

export const noAutoLoadingHomepage = Template.bind( {} );
noAutoLoadingHomepage.args = {
	...baseProps,
	hasAutoLoadingHomepage: false,
};

export const isActivating = Template.bind( {} );
isActivating.args = {
	...baseProps,
	isActivating: true,
};
