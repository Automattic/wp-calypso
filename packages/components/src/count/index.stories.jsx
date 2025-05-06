import Count from '.';

export default { component: Count, title: 'Unaudited/Count' };

const Template = ( args ) => {
	return <Count { ...args } />;
};

export const Default = Template.bind( {} );
Default.args = {
	compact: false,
	primary: false,
	count: 42000,
};
