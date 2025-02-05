import SignupWrapper from './components/signup-wrapper';

type Flow = 'regular' | 'wc-asia';

type Props = {
	flow?: Flow;
};

const AgencySignupV2 = ( { flow }: Props ) => {
	return (
		<SignupWrapper>
			<div>Agency Signup V2: { flow }</div>
		</SignupWrapper>
	);
};

export default AgencySignupV2;
