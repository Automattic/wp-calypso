import LinkCard from 'calypso/components/link-card';

const background = 'studio-wordpress-blue-80';
const label = 'The label goes here';
const title = 'The title of the card goes here, this can be a longer string';
const cta = 'cta goes here';
const url = '/url';
const onClick = () => {
	console.log( 'Card clicked' );
};

const LinkCardExample = () => {
	return (
		<LinkCard
			background={ background }
			label={ label }
			title={ title }
			cta={ cta }
			url={ url }
			onClick={ onClick }
		/>
	);
};

LinkCardExample.displayName = 'LinkCardExample';

export default LinkCardExample;
