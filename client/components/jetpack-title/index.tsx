import { __experimentalHStack as HStack } from '@wordpress/components';
import JetpackLogo from 'calypso/components/jetpack-logo';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';

type JetpackTitleProps = {
	title: React.ReactNode;
};

const JetpackTitle = ( { title }: JetpackTitleProps ) => (
	<HStack alignment="center" justify="start" spacing={ 2 }>
		{ ! isJetpackCloud() && <JetpackLogo size={ 20 } /> }
		{ typeof title === 'string' ? <span>{ title }</span> : title }
	</HStack>
);

export default JetpackTitle;
