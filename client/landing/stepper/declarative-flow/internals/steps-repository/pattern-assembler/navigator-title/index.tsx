import DocumentHead from 'calypso/components/data/document-head';

interface Props {
	title: string;
}

const NavigatorTitle = ( { title }: Props ) => (
	<>
		<DocumentHead title={ title } />
		{ title }
	</>
);

export default NavigatorTitle;
