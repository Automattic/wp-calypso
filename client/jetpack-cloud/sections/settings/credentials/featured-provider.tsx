import { FunctionComponent } from 'react';

interface Props {
	host: string;
}

const FeaturedProvider: FunctionComponent< Props > = ( { host } ) => {
	return <div>{ host }</div>;
};

export default FeaturedProvider;
