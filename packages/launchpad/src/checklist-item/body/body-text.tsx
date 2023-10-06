type BodyTextProps = {
	text: string;
};

const BodyText = ( { text }: BodyTextProps ) => {
	return <div>{ text }</div>;
};

export default BodyText;
