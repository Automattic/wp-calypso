import BaseCard from '../base-card';

export default {
	title: 'Unaudited/Highlight Cards/BaseCard',
	component: BaseCard,
	argTypes: {
		heading: { control: 'text' },
		body: { control: 'text' },
	},
};

const Template = ( { heading, body } ) => {
	return (
		<div
			style={ { position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' } }
		>
			<BaseCard heading={ <div>{ heading }</div> }>
				<div>{ body }</div>
			</BaseCard>
		</div>
	);
};

export const BaseCard_ = Template.bind( {} );
BaseCard_.args = {
	heading: 'Customizable Heading',
	body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
};
