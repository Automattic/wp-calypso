import { translate } from 'i18n-calypso';
import { Flow } from 'calypso/landing/stepper/declarative-flow/internals/types';

const Blog: Flow = {
	name: 'blog',
	get title() {
		return translate( 'Blog' );
	},
	useSteps() {
		return [
			{
				slug: 'blogger-intent',
				asyncComponent: () => import( './internals/steps-repository/blogger-intent' ),
			},
		];
	},

	useStepNavigation() {
		return {};
	},
};

export default Blog;
