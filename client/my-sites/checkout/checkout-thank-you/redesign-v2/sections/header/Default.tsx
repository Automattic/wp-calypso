import preventWidows from 'calypso/lib/post-normalizer/rule-prevent-widows';

import './style.scss';

interface DefaultThankYouHeaderContainerProps {
	children: string;
}

const DefaultThankYouHeader: React.FC< DefaultThankYouHeaderContainerProps > = ( { children } ) => {
	return <h1 className="checkout-thank-you__header-heading">{ preventWidows( children ) }</h1>;
};

export default DefaultThankYouHeader;
