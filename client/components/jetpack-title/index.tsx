import { __experimentalHStack as HStack } from '@wordpress/components';
import JetpackLogo from 'calypso/components/jetpack-logo';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';

type JetpackTitleProps = {
	title: string;
};

const JetpackTitle = ( { title }: JetpackTitleProps ) => (
	<HStack alignment="center" justify="start" spacing={ 2 }>
		{ ! isJetpackCloud() && <JetpackLogo size={ 20 } /> }
		<span>{ title }</span>
	</HStack>
);

export default JetpackTitle;
