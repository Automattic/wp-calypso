import FormLabel from '.';

export default { component: FormLabel, title: 'Unaudited/Form Label' };

const Template = ( args ) => {
	return (
		<form>
			<FormLabel { ...args }>Button label</FormLabel>
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

export const WithCoreStyles = Template.bind( {} );
WithCoreStyles.args = {
	className: 'button-label',
	hasCoreStyles: true,
};

export const WithCoreStylesNoCaps = Template.bind( {} );
WithCoreStylesNoCaps.args = {
	className: 'button-label',
	hasCoreStylesNoCaps: true,
};
