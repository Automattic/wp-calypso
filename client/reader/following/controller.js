import page from 'page';

const exported = {
	followingManage( context, next ) {
		page.redirect( '/read/subscriptions' );
		next();
	},
};

export default exported;

export const { followingManage } = exported;
