const config = {
	init: {
		text: 'Welcome to WordPress.com!',
		next: 'my-sites',
	},
	'my-sites': {
		target: 'my-sites',
		type: 'bullseye',
		placement: 'below',
		text: `First things first. Up here, you'll find tools for managing your site's content and design.`,
		next: 'reader'
	},
	reader: {
		target: 'reader',
		type: 'bullseye',
		placement: 'beside',
		text: `This is the Reader. It shows you fresh posts from other sites you're following.`,
		next: 'finish'
	},
	finish: {
		target: 'reader',
		placement: 'beside',
		text: `You're done. Enjoy! :)`
	}
}

export default config;
