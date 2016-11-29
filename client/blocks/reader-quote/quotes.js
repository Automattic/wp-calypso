const quotes = [
	{
		content: 'Everything we hear is an opinion, not a fact. Everything we see is a perspective, not the truth.',
		author: 'Marcus Aurelius'
	}, {
		content: 'Waste no more time arguing about what a good man should be. Be one.',
		author: 'Marcus Aurelius'
	}, {
		content: 'Let not your mind run on what you lack as much as on what you have already.',
		author: 'Marcus Aurelius'
	}
];

export default () => quotes[ Math.floor( Math.random() * quotes.length ) ];
