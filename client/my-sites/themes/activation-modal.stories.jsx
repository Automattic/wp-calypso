import { action } from '@storybook/addon-actions';
import { ReduxDecorator } from 'calypso/__mocks__/storybook/redux';
import { ActivationModal } from './activation-modal';

export default {
	title: 'client/my-sites/themes/ActivationModal',
	component: ActivationModal,
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

const Template = ( args ) => <ActivationModal { ...args } />;

const baseProps = {
	acceptActivationModal: action( 'acceptActivationModal' ),
	activateTheme: action( 'activateTheme' ),
	hasActivated: false,
	dismissActivationModal: action( 'dismissActivationModal' ),
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

export const isActivating = Template.bind( {} );
isActivating.args = {
	...baseProps,
	isActivating: true,
};
