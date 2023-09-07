// import { useSiteIdParam } from '../hooks/use-site-id-param';
// import { useSiteSlug } from '../hooks/use-site-slug';
import DomainContactInfo from './internals/steps-repository/domain-contact-info';
import type { Flow, ProvidedDependencies } from './internals/types';

const domainUserTransfer: Flow = {
	name: 'domain-user-transfer',
	useSteps() {
		return [ { slug: 'domain-contact-info', component: DomainContactInfo } ];
	},

	useStepNavigation( _currentStep, navigate ) {
		// const siteId = useSiteIdParam();
		// const siteSlug = useSiteSlug();

		function submit( providedDependencies: ProvidedDependencies = {} ) {
			return providedDependencies;
		}

		const goBack = () => {
			return;
		};

		const goNext = () => {
			switch ( _currentStep ) {
				case 'contact-info':
					return navigate( '/manage/domains' );
			}
		};

		const goToStep = ( step: string ) => {
			navigate( step );
		};

		return { goNext, goBack, goToStep, submit };
	},
};

export default domainUserTransfer;
