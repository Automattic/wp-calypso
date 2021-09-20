import { SiteData } from 'calypso/state/ui/selectors/site-data';
import { stepSlug } from '../constants';

type ValueOf< T > = T[ keyof T ];
type Maybe< T > = T | null;

type PossibleSlugs = ValueOf< typeof stepSlug >;

type AuthCodeValidationError = {
	error: string;
	message: string;
};

export type AuthCodeValidationData = {
	domain: string;
	selectedSite: Maybe< SiteData >;
	verificationData: {
		ownership_verification_data: {
			verification_type: 'auth_code';
			verification_data: string;
		};
	};
};

export type DomainStepAuthCodeProps = {
	authCodeDescription: JSX.Element;
	buttonMessage: string;
	className: string;
	domain: string;
	onBeforeValidate: () => void;
	validateHandler: (
		authData: AuthCodeValidationData,
		onDone?: ( error: AuthCodeValidationError ) => void
	) => unknown;
	pageSlug: PossibleSlugs;
	progressStepList: Record< PossibleSlugs, string >;
	selectedSite: Maybe< SiteData >;
};
