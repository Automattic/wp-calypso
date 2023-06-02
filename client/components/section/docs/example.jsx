import Section from 'calypso/components/section';

const content = 'this is an example content and it could be longer or a react node';

const SectionExample = () => {
	return (
		<>
			<Section header="This is a section">
				<div>{ content }</div>
			</Section>
		</>
	);
};

SectionExample.displayName = 'SectionExample';

export default SectionExample;
