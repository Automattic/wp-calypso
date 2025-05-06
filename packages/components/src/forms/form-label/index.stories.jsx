import FormLabel from '.';

export default { component: FormLabel, title: 'Unaudited/Form Label' };

const Template = ( args ) => {
	return (
		<form>
			<FormLabel { ...args }>Button Label</FormLabel>
			<input type="button" value="Test Button" />
		</form>
	);
};

export const Default = Template.bind( {} );
Default.args = {
	className: 'button-label',
	optional: false,
	required: false,
};
