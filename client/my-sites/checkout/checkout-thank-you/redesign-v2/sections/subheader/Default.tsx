import preventWidows from 'calypso/lib/post-normalizer/rule-prevent-widows';

import './style.scss';

interface DefaultSubHeaderContainerProps {
	children: string | React.ReactNode;
}

const DefaultSubHeader: React.FC< DefaultSubHeaderContainerProps > = ( { children } ) => {
	return <h1 className="checkout-thank-you__header-text">{ preventWidows( children ) }</h1>;
};

export default DefaultSubHeader;
