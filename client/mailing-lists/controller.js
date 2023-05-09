import { createElement } from 'react';
import MainComponent from './main';

export default {
	unsubscribe( context, next ) {
		const { email, category, hmac, ...rest } = context.query;
		context.primary = createElement( MainComponent, {
			email,
			category,
			hmac,
			context: rest,
		} );
		next();
	},
};
