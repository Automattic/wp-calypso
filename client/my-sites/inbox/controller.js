import React from 'react';

export default {
	inboxManagement( pageContext, next ) {
		pageContext.primary = <h1>Inbox</h1>;

		next();
	},
};
