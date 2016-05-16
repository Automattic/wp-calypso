function root() {
	return '/plans';
}

function plans( siteName = ':site', intervalType = ':intervalType?' ) {
	return root() + `/${ intervalType }` + `/${ siteName }`;
}

function plansDestination( siteName = ':site', destinationType = ':destinationType?' ) {
	return plans( siteName ) + `/${ destinationType }`;
}

export default {
	plans,
	plansDestination
};
