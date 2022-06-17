import * as React from 'react';

interface Props {
	siteId: number;
	offer: object;
}

const JetpackCancellationOfferStep: React.FC< Props > = ( props ) => {
	const { siteId } = props;
	return <p data-site={ siteId }>Cancellation offers</p>;
};

export default JetpackCancellationOfferStep;
